import { palette } from "@/constants/theme-collections";
import type { CommunityTheme } from "@/types/preferences/community-theme";
import type { ThemeCollection } from "@/types/preferences/theme-collection";
import type { PaletteSpec } from "@/types/preferences/theme-collection-palette-spec";

/**
 * Tema publicado na galeria aplicado como o que ele é: uma coleção de verdade.
 *
 * O pacote já era um `PaletteSpec` completo — e o backend gasta o gate de contraste justamente
 * conferindo as cores dele — mas o "Aplicar" amassava o pacote em dois HSVs (accent e fundo) e
 * o resto caía no motor de cores livres. Resultado: `muted`, `border`, `text` e o próprio
 * `primary` publicado nunca chegavam ao DOM, e o item selecionado do menu saía na cor derivada.
 * Aqui o pacote vira `ThemeCollection` e passa pelo MESMO `palette()` dos temas hardcoded, então
 * cada campo declarado vale.
 *
 * Nada aqui confia no JSON: storage é editável à mão, e `palette()` espalha `extra` e `shadows`
 * direto nas declarações CSS. Um pacote forjado colocaria CSS cru no `<style>` do tema — por
 * isso só as chaves conhecidas, nas formas que o backend também exige, passam.
 */

/** O id que o backend gera (`theme_` + uuid sem traços) — é o que viaja para a conta. */
const COMMUNITY_ID = /^theme_[0-9a-f]{32}$/;
const HEX = /^#[0-9a-f]{6}$/;
const GRADIENT = /^linear-gradient\(\d+deg, #[0-9a-f]{6}, #[0-9a-f]{6}\)$/;
const RADIUS = /^\d+(\.\d+)?(px|rem)$/;
const FONT = /^[A-Za-z][A-Za-z0-9 _-]{0,63}$/;

const registry = new Map<string, ThemeCollection>();

/**
 * O pacote de origem de cada registro: é o que faz a coleção ser refeita quando o autor
 * republica o tema, em vez de ficar a versão antiga em memória até o próximo reload.
 */
const sources = new Map<string, string>();

/** É id de tema da galeria? (antes de o pacote estar em mãos, é tudo que se sabe dele). */
export function isCommunityThemeId(id: unknown): id is string {
  return typeof id === "string" && COMMUNITY_ID.test(id);
}

function color(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  return typeof value === "string" && HEX.test(value) ? value : undefined;
}

/**
 * Confere o palette do pacote. Devolve `null` para o que não é aplicável — os obrigatórios
 * faltando ou qualquer cor fora de hex de 6 dígitos, porque `palette()` chama `hexToRgb()`
 * neles sem guarda e um valor estranho não degrada o tema: quebra a aplicação inteira.
 */
function readPalette(packageJson: string): PaletteSpec | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(packageJson);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;

  const rawPalette = (parsed as Record<string, unknown>).palette;
  if (typeof rawPalette !== "object" || rawPalette === null) return null;
  const source = rawPalette as Record<string, unknown>;

  const background = color(source, "background");
  const surface = color(source, "surface");
  const muted = color(source, "muted");
  const border = color(source, "border");
  const primary = color(source, "primary");
  const onPrimary = color(source, "onPrimary");
  if (!background || !surface || !muted || !border || !primary || !onPrimary) return null;

  const rawText = source.text;
  if (typeof rawText !== "object" || rawText === null) return null;
  const text = rawText as Record<string, unknown>;
  const strong = color(text, "strong");
  const subtle = color(text, "subtle");
  const date = color(text, "date");
  if (!strong || !subtle || !date) return null;

  const spec: PaletteSpec = {
    background,
    surface,
    muted,
    border,
    primary,
    onPrimary,
    text: { strong, subtle, date },
  };

  // Opcionais: entra o que tem a forma certa; o resto é simplesmente ignorado.
  const optional = (key: string) => color(source, key);
  for (const key of [
    "input",
    "soft",
    "secondary",
    "onSecondary",
    "accent",
    "onAccent",
    "ring",
  ] as const) {
    const value = optional(key);
    if (value) spec[key] = value;
  }
  if (typeof source.gradient === "string" && GRADIENT.test(source.gradient)) {
    spec.gradient = source.gradient;
  }
  if (typeof source.radius === "string" && RADIUS.test(source.radius)) spec.radius = source.radius;
  if (typeof source.fontSans === "string" && FONT.test(source.fontSans))
    spec.fontSans = source.fontSans;
  if (typeof source.surfaceAlpha === "number" && Number.isFinite(source.surfaceAlpha)) {
    spec.surfaceAlpha = Math.min(100, Math.max(0, source.surfaceAlpha));
  }

  return spec;
}

/** Constrói a coleção a partir do pacote. `null` quando o palette não é aplicável. */
export function buildCommunityCollection(theme: CommunityTheme): ThemeCollection | null {
  const spec = readPalette(theme.packageJson);
  if (!spec) return null;

  return {
    id: theme.id,
    name: theme.name || "Tema da comunidade",
    description: `Tema publicado na galeria (${theme.modeDefault === "dark" ? "escuro" : "claro"} por padrão).`,
    // A barra do navegador acompanha o fundo: é o que o app tem de cor sólida representativa.
    metaColor: spec.background,
    // Um pacote declara UMA paleta; o outro modo cai na clara de propósito (como os temas
    // hardcoded só-claro), então o tema vale nos dois modos sem inventar variante.
    tokens: { light: palette(spec) },
    surfaceHex: spec.surface,
    surfaceAlpha: spec.surfaceAlpha ?? 100,
    preview: {
      background: spec.background,
      surface: spec.surface,
      primary: spec.primary,
      onPrimary: spec.onPrimary,
      border: spec.border,
      effect: (spec.surfaceAlpha ?? 100) < 100 ? "glass" : "flat",
    },
  };
}

/** Registra o pacote (idempotente) e devolve a coleção; `null` se ele não é aplicável. */
export function registerCommunityTheme(theme: CommunityTheme): ThemeCollection | null {
  if (!isCommunityThemeId(theme.id)) return null;
  const source = `${theme.name}\u0000${theme.packageJson}`;
  if (sources.get(theme.id) === source) return registry.get(theme.id) ?? null;

  const collection = buildCommunityCollection(theme);
  if (!collection) return null;
  registry.set(collection.id, collection);
  sources.set(collection.id, source);
  return collection;
}

/** Já temos este tema em memória? (evita buscar o mesmo pacote duas vezes). */
export function hasCommunityTheme(id: string): boolean {
  return registry.has(id);
}

export function resolveCommunityTheme(id: string): ThemeCollection | null {
  return registry.get(id) ?? null;
}

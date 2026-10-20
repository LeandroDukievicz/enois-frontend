import { THEME_COLLECTIONS } from "@/constants/theme-collections";
import type { Theme } from "@/types/preferences/theme";
import type { ThemeCollection } from "@/types/preferences/theme-collection";
import type { CollectionOverrides } from "@/types/preferences/theme-collection-overrides";

import { PAGE_PAINT_TARGETS, paintGradientCss } from "./build-background-style";
import { withAlpha } from "./build-background-style";
import { buildAccentTokens } from "./build-theme-tokens";
import { resolveCommunityTheme } from "./community-collection";

/**
 * Chaves do destaque que a cor livre sobrescreve num tema. Superfícies, bordas,
 * sombras e os relevos ficam do tema: é a identidade que continua de pé — o que o
 * usuário pinta é o destaque (e o fundo, pelo plano de fundo).
 */
const ACCENT_OVERRIDE_KEYS = [
  "--primary",
  "--primary-foreground",
  "--primary-text",
  "--primary-soft",
  "--secondary",
  "--secondary-foreground",
  "--accent",
  "--accent-foreground",
  "--ring",
  "--gradient-primary",
  "--mentorship-button",
  "--highlight-project",
  "--highlight-project-text",
  "--background-user-project",
  "--project-text",
] as const;

/**
 * Resolve o identificador para uma coleção: as hardcoded da coleção e os temas da galeria
 * publicados, já registrados por `community-collection`.
 *
 * Identificador inválido (ou tema removido em uma versão futura) devolve `null` —
 * e a aplicação cai no padrão da marca, nunca num tema pela metade.
 */
export function resolveThemeCollection(id: string | null | undefined): ThemeCollection | null {
  if (!id) return null;
  return THEME_COLLECTIONS.find((collection) => collection.id === id) ?? resolveCommunityTheme(id);
}

/**
 * CSS completo de um tema da coleção: os tokens no seletor de especificidade alta
 * (a mesma lição do tema de cores livres — `html:root`/`html:root.dark`, porque
 * `:root` sozinho empata com o CSS da marca e um chunk por rota ganhava depois)
 * mais o CSS estrutural do tema, que já vem escopado por `data-theme`.
 *
 * O modo que o tema não define não existe aqui: um tema só-claro injetado no
 * escuro traz os tokens claros no seletor `.dark` — inclusive o texto claro —,
 * que é o que o mantém legível; um tema só-escuro vale nos dois modos pelo mesmo
 * caminho, na direção oposta.
 *
 * A camada livre entra por cima: o destaque da cor livre (só as chaves do
 * destaque — superfícies, bordas, sombras e relevos seguem do tema). O plano de
 * fundo e a cor de widget livres entram DEPOIS, no bloco genérico do apply.
 */
export function buildCollectionCss(
  collection: ThemeCollection,
  mode: Theme,
  overrides?: CollectionOverrides,
): string {
  const tokens =
    mode === "dark" ? (collection.tokens.dark ?? collection.tokens.light) : collection.tokens.light;

  let effective: Record<string, string> = tokens;

  if (overrides?.accent) {
    const accent = buildAccentTokens(overrides.accent, mode, {
      alpha: overrides.accentAlpha ?? 100,
    });
    effective = { ...effective };
    for (const key of ACCENT_OVERRIDE_KEYS) {
      const value = accent[key];
      if (value !== undefined) effective[key] = value;
    }
  }

  const widgetAlpha = overrides?.widgetAlpha ?? collection.surfaceAlpha ?? null;
  if (widgetAlpha !== null && widgetAlpha < 100) {
    effective = { ...effective };
    for (const key of ["--card", "--popover", "--sidebar", "--surface-card"]) {
      const raw = collection.surfaceHex ?? effective[key];
      if (raw && !raw.includes("gradient") && !raw.includes("color-mix")) {
        effective[key] = withAlpha(raw, widgetAlpha);
      }
    }
  }

  const pageAlpha = overrides?.pageAlpha ?? null;
  const rawBackground = effective["--background"];
  if (pageAlpha !== null && pageAlpha < 100 && rawBackground && rawBackground.startsWith("#")) {
    effective = { ...effective, "--background": withAlpha(rawBackground, pageAlpha) };
  }

  const declarations = Object.entries(effective)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  const selector = mode === "dark" ? "html:root.dark" : "html:root";
  const varsBlock = `${selector}[data-theme="${collection.id}"] {\n${declarations}\n}`;

  // Fundo do tema em degradê precisa da pintura por background-image (gradiente não
  // é cor válida para o background-color do utilitário) — senão a página fica branca
  // e só os cartões mostram o tema. Ancorado na viewport: sem fatiar entre elementos.
  const paint = paintGradientCss(
    effective["--background"] ?? "",
    `html:root[data-theme="${collection.id}"], html:root.dark[data-theme="${collection.id}"]`,
    PAGE_PAINT_TARGETS,
    true,
  );

  const extra = [collection.css, paint].filter(Boolean).join("\n");
  return extra ? `${varsBlock}\n${extra}` : varsBlock;
}

import { THEME_TOKEN_NAMES } from "@/constants/theme-tokens";
import type { CommunityTheme } from "@/types/preferences/community-theme";
import { describe, expect, it } from "vitest";

import { buildCollectionCss, resolveThemeCollection } from "./build-collection-css";
import {
  hasCommunityTheme,
  isCommunityThemeId,
  registerCommunityTheme,
} from "./community-collection";

/**
 * O contrato de um pacote publicado na galeria: ele é aplicado como coleção, campo a campo.
 *
 * Os três casos que motivaram isto são justamente o que o caminho antigo descartava — `muted`
 * (o fundo do item selecionado do menu), o `primary` do autor (virava destaque livre derivado em
 * hue HSV dentro de oklch) e o resto do palette. Se algum deles voltar a ser amassado, um
 * destes testes quebra.
 */
const ID = `theme_${"0".repeat(31)}a`;

const DRACULA = {
  background: "#282a36",
  surface: "#44475a",
  muted: "#44475a",
  border: "#6272a4",
  primary: "#bd93f9",
  onPrimary: "#282a36",
  text: { strong: "#f8f8f2", subtle: "#bfbfbf", date: "#8be9fd" },
};

function packageOf(palette: unknown): string {
  return JSON.stringify({ palette });
}

function communityOf(overrides: Partial<CommunityTheme> = {}): CommunityTheme {
  return {
    id: ID,
    name: "Dracula",
    modeDefault: "dark",
    packageJson: packageOf(DRACULA),
    ...overrides,
  };
}

describe("tema da galeria aplicado como coleção", () => {
  it("leva o muted do pacote para --muted e --surface-2", () => {
    const collection = registerCommunityTheme(communityOf({ id: `theme_${"1".repeat(32)}` }))!;

    expect(collection.tokens.light["--muted"]).toBe(DRACULA.muted);
    expect(collection.tokens.light["--surface-2"]).toBe(DRACULA.muted);
    expect(buildCollectionCss(collection, "dark")).toContain(`--surface-2: ${DRACULA.muted};`);
  });

  it("usa o primary do pacote como ele é, não um destaque derivado", () => {
    const collection = registerCommunityTheme(communityOf({ id: `theme_${"2".repeat(32)}` }))!;

    expect(collection.tokens.light["--primary"]).toBe("#bd93f9");
    expect(collection.tokens.light["--primary-foreground"]).toBe("#282a36");
    expect(collection.tokens.light["--primary"]).not.toMatch(/oklch/);
  });

  it("obedece ao texto do pacote (o tema é dono da leitura)", () => {
    const collection = registerCommunityTheme(communityOf({ id: `theme_${"3".repeat(32)}` }))!;

    expect(collection.tokens.light["--foreground"]).toBe(DRACULA.text.strong);
    expect(collection.tokens.light["--text-subtle"]).toBe(DRACULA.text.subtle);
    expect(collection.tokens.light["--border"]).toBe(DRACULA.border);
  });

  it("cobre todos os tokens da marca, como o teste das coleções hardcoded exige", () => {
    const collection = registerCommunityTheme(communityOf({ id: `theme_${"4".repeat(32)}` }))!;

    for (const name of THEME_TOKEN_NAMES) {
      expect(collection.tokens.light[name], `faltou ${name}`).toBeTruthy();
    }
    expect(collection.preview.primary).toBe("#bd93f9");
    expect(collection.preview.onPrimary).toBe("#282a36");
    expect(collection.metaColor).toBe(DRACULA.background);
  });

  it("não deixa o pacote injetar CSS cru pelos campos que a galeria não tem", () => {
    const forged = {
      ...DRACULA,
      shadows: { soft: "url(evil) ", card: "; position: fixed" },
      extra: { "--background": "red; } html { color: pink" },
      sucesso: "#00ff00",
    };
    const collection = registerCommunityTheme(
      communityOf({ id: `theme_${"5".repeat(32)}`, packageJson: packageOf(forged) }),
    )!;

    expect(collection.tokens.light["--background"]).toBe(DRACULA.background);
    expect(JSON.stringify(collection.tokens.light)).not.toContain("position: fixed");
    expect(JSON.stringify(collection.tokens.light)).not.toContain("color: pink");
    expect(JSON.stringify(collection.tokens.light)).not.toContain("url(evil)");
  });

  it("recusa pacote sem cor obrigatória ou fora de hex de 6 dígitos", () => {
    const id = `theme_${"6".repeat(32)}`;
    const recusa = (palette: unknown) =>
      expect(
        registerCommunityTheme(communityOf({ id, packageJson: packageOf(palette) })),
      ).toBeNull();

    recusa({ ...DRACULA, muted: undefined });
    recusa({ ...DRACULA, primary: "rebeccapurple" });
    recusa({ ...DRACULA, text: { strong: "#f8f8f2", subtle: "#bfbfbf" } });
    expect(registerCommunityTheme(communityOf({ id, packageJson: "nada de json" }))).toBeNull();
    expect(hasCommunityTheme(id)).toBe(false);
  });

  it("ignora campo que o contrato não tem e aceita o que ele tem", () => {
    const collection = registerCommunityTheme(
      communityOf({
        id: `theme_${"7".repeat(32)}`,
        packageJson: packageOf({
          ...DRACULA,
          destructive: "#ff5555",
          radius: "0.5rem",
          fontSans: "Consolas",
        }),
      }),
    )!;

    // Semânticas ficam com a marca de propósito (contrato em theme-tokens); raio e fonte passam.
    expect(JSON.stringify(collection.tokens.light)).not.toContain("#ff5555");
    expect(collection.tokens.light["--radius"]).toBe("0.5rem");
    expect(collection.tokens.light["--font-sans"]).toBe("Consolas");
  });

  it("resolve pelo id depois de registrado, e só com id de galeria", () => {
    const id = `theme_${"8".repeat(32)}`;
    expect(resolveThemeCollection(id)).toBeNull();
    registerCommunityTheme(communityOf({ id }));
    expect(resolveThemeCollection(id)?.id).toBe(id);
    expect(isCommunityThemeId(id)).toBe(true);
    expect(isCommunityThemeId("aero-glass")).toBe(false);
    expect(isCommunityThemeId(`theme_${"z".repeat(32)}`)).toBe(false);
    expect(registerCommunityTheme(communityOf({ id: "tema-falsificado" }))).toBeNull();
  });

  it("refaz a coleção quando o mesmo id chega com outro pacote", () => {
    const id = `theme_${"9".repeat(32)}`;
    const antes = registerCommunityTheme(communityOf({ id }))!;
    const depois = registerCommunityTheme(
      communityOf({ id, packageJson: packageOf({ ...DRACULA, muted: "#6272a4" }) }),
    )!;

    expect(depois).not.toBe(antes);
    expect(depois.tokens.light["--surface-2"]).toBe("#6272a4");
  });
});

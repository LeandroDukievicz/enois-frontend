import { DEFAULT_THEME_SETTINGS } from "@/constants/theme-defaults";
import type { BackgroundStyle } from "@/types/preferences/background-style";
import type { CommunityTheme } from "@/types/preferences/community-theme";
import type { Theme } from "@/types/preferences/theme";
import type { ThemeSettings } from "@/types/preferences/theme-settings";
import type { PreferencesState } from "@/types/stores/preferences-state";
import type { PreferencesStorageValue } from "@/types/stores/preferences-storage-value";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { resolveThemeCollection } from "@/lib/theme/build-collection-css";
import { clampThemeSettings } from "@/lib/theme/build-theme-tokens";
import { isCommunityThemeId } from "@/lib/theme/community-collection";

const PREFERENCES_STORAGE_KEY = "connect-grow-preferences";
const LEGACY_THEME_STORAGE_KEY = "connect-grow-theme";
const LEGACY_SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

function readNumber(source: Record<string, unknown>, key: string, fallback: number): number {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Traz o tema salvo de volta para uma forma válida.
 *
 * O storage é editável à mão e sobrevive a versões antigas do app, então nada
 * aqui pode confiar no formato: valores fora das faixas seguras são corrigidos.
 */
function normalizeThemeSettings(value: unknown): ThemeSettings {
  if (typeof value !== "object" || value === null) return DEFAULT_THEME_SETTINGS;

  const settings = value as Record<string, unknown>;
  const accent = (settings.accent ?? {}) as Record<string, unknown>;
  const background = (settings.background ?? {}) as Record<string, unknown>;

  return clampThemeSettings({
    accent: {
      hue: readNumber(accent, "hue", DEFAULT_THEME_SETTINGS.accent.hue),
      chroma: readNumber(accent, "chroma", DEFAULT_THEME_SETTINGS.accent.chroma),
      lightness: readNumber(accent, "lightness", DEFAULT_THEME_SETTINGS.accent.lightness),
    },
    background: {
      hue: readNumber(background, "hue", DEFAULT_THEME_SETTINGS.background.hue),
      chroma: readNumber(background, "chroma", DEFAULT_THEME_SETTINGS.background.chroma),
    },
  });
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const BACKGROUND_DEFAULTS = { color: "#f4f1fb", from: "#f9f8ff", to: "#e6dcf7" } as const;

/**
 * Plano de fundo do storage: tipo e direção válidos, cores hex; qualquer coisa
 * estranha no localStorage volta a `null` (comportamento automático).
 */
function normalizeBackgroundStyle(value: unknown): BackgroundStyle | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  const type = raw.type === "solid" || raw.type === "gradient" ? raw.type : null;
  if (!type) return null;
  const direction =
    raw.direction === "vertical" ||
    raw.direction === "radial" ||
    raw.direction === "horizontal" ||
    raw.direction === "custom" ||
    raw.direction === "diagonal"
      ? raw.direction
      : "diagonal";
  const hex = (value: unknown, fallback: string) =>
    typeof value === "string" && HEX_COLOR.test(value) ? value : fallback;
  const alpha = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 100;
  return {
    type,
    direction,
    color: hex(raw.color, BACKGROUND_DEFAULTS.color),
    from: hex(raw.from, BACKGROUND_DEFAULTS.from),
    to: hex(raw.to, BACKGROUND_DEFAULTS.to),
    alpha: alpha(raw.alpha),
    fromAlpha: alpha(raw.fromAlpha),
    toAlpha: alpha(raw.toAlpha),
    angle: alpha(raw.angle),
  };
}

/**
 * Coleção temática do storage: só aceita identificador que existe hoje.
 *
 * Um tema removido (ou um valor inventado no localStorage) volta a `null` — o
 * padrão da marca — em vez de carregar um tema pela metade. Id de galeria sem o
 * pacote correspondente também volta a `null`: o tema existe, mas não tem o que
 * resolver, e aplicar metade dele seria pior que aplicar o padrão.
 */
function normalizeThemeCollection(value: unknown, community: CommunityTheme | null): string | null {
  if (typeof value !== "string") return null;
  if (resolveThemeCollection(value)) return value;
  return community && community.id === value ? value : null;
}

/** Pacote da galeria do storage: id no formato que o backend gera e JSON dentro do teto dele. */
function normalizeCommunityTheme(value: unknown): CommunityTheme | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== "string" || !isCommunityThemeId(raw.id)) return null;
  if (
    typeof raw.packageJson !== "string" ||
    raw.packageJson.length === 0 ||
    raw.packageJson.length > 4096
  ) {
    return null;
  }
  return {
    id: raw.id,
    name: typeof raw.name === "string" ? raw.name : "",
    modeDefault: raw.modeDefault === "dark" ? "dark" : "light",
    packageJson: raw.packageJson,
  };
}

const preferencesStorage = {
  getItem: (name: string) => {
    const stored = localStorage.getItem(name);
    if (stored !== null) {
      try {
        const parsed = JSON.parse(stored) as PreferencesStorageValue;

        if (parsed.state) {
          parsed.state.theme = parsed.state.theme === "dark" ? "dark" : "light";
          parsed.state.themeSettings = normalizeThemeSettings(parsed.state.themeSettings);
          const communityTheme = normalizeCommunityTheme(parsed.state.communityTheme);
          parsed.state.communityTheme = communityTheme;
          parsed.state.themeCollection = normalizeThemeCollection(
            parsed.state.themeCollection,
            communityTheme,
          );
          // Estado salvo ANTES desta data existir: quem já tinha um tema escolhido aqui vale como
          // "escolhido agora" — senão a primeira recarga depois da correção deixaria o valor
          // antigo da conta vencer e a pessoa perderia o tema que estava vendo.
          const storedAt = parsed.state.themeCollectionUpdatedAt;
          parsed.state.themeCollectionUpdatedAt =
            typeof storedAt === "number" && Number.isFinite(storedAt)
              ? storedAt
              : parsed.state.themeCollection
                ? Date.now()
                : null;
          parsed.state.widgetBackground = normalizeBackgroundStyle(parsed.state.widgetBackground);
          parsed.state.pageBackground = normalizeBackgroundStyle(parsed.state.pageBackground);
          parsed.state.accentAlpha =
            typeof parsed.state.accentAlpha === "number" &&
            Number.isFinite(parsed.state.accentAlpha)
              ? Math.min(100, Math.max(0, parsed.state.accentAlpha))
              : 100;
          parsed.state.widgetAlpha =
            typeof parsed.state.widgetAlpha === "number" &&
            Number.isFinite(parsed.state.widgetAlpha)
              ? Math.min(100, Math.max(0, parsed.state.widgetAlpha))
              : null;
          parsed.state.pageAlpha =
            typeof parsed.state.pageAlpha === "number" && Number.isFinite(parsed.state.pageAlpha)
              ? Math.min(100, Math.max(0, parsed.state.pageAlpha))
              : null;
        }

        return JSON.stringify(parsed);
      } catch {
        return stored;
      }
    }

    const legacyTheme = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    const legacySidebarCollapsed = localStorage.getItem(LEGACY_SIDEBAR_STORAGE_KEY);

    if (legacyTheme === null && legacySidebarCollapsed === null) return null;

    return JSON.stringify({
      state: {
        theme: legacyTheme === "dark" ? "dark" : "light",
        sidebarCollapsed: legacySidebarCollapsed === "true",
      },
      version: 0,
    });
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value);
    localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    localStorage.removeItem(LEGACY_SIDEBAR_STORAGE_KEY);
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "light",
      sidebarCollapsed: false,
      themeSettings: DEFAULT_THEME_SETTINGS,
      themeCollection: null,
      /** Quando a coleção foi escolhida AQUI (para resolver conflito com a conta). */
      themeCollectionUpdatedAt: null,
      /** Pacote do tema da galeria ativo; `null` com coleção hardcoded ou sem coleção. */
      communityTheme: null,
      widgetBackground: null,
      pageBackground: null,
      accentAlpha: 100,
      widgetAlpha: null,
      pageAlpha: null,

      setTheme: (theme: Theme) => set({ theme }),
      setThemeSettings: (themeSettings: ThemeSettings) =>
        set({ themeSettings: clampThemeSettings(themeSettings) }),
      // Restaurar o padrão devolve a marca inteira: cores livres E sem coleção.
      resetThemeSettings: () =>
        set({
          themeSettings: DEFAULT_THEME_SETTINGS,
          themeCollection: null,
          themeCollectionUpdatedAt: Date.now(),
          communityTheme: null,
          widgetBackground: null,
          pageBackground: null,
          accentAlpha: 100,
          widgetAlpha: null,
          pageAlpha: null,
        }),
      setThemeCollection: (themeCollection: string | null) =>
        set((state) => ({
          themeCollection,
          themeCollectionUpdatedAt: Date.now(),
          // Trocar para um tema hardcoded (ou o padrão) deixa de ter pacote que resolva a id.
          communityTheme:
            themeCollection && isCommunityThemeId(themeCollection) ? state.communityTheme : null,
        })),
      setCommunityTheme: (communityTheme: CommunityTheme | null) => set({ communityTheme }),
      setWidgetBackground: (widgetBackground: BackgroundStyle | null) => set({ widgetBackground }),
      setPageBackground: (pageBackground: BackgroundStyle | null) => set({ pageBackground }),
      setAccentAlpha: (accentAlpha: number) => set({ accentAlpha }),
      setWidgetAlpha: (widgetAlpha: number | null) => set({ widgetAlpha }),
      setPageAlpha: (pageAlpha: number | null) => set({ pageAlpha }),
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => preferencesStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        themeSettings: state.themeSettings,
        themeCollection: state.themeCollection,
        themeCollectionUpdatedAt: state.themeCollectionUpdatedAt,
        communityTheme: state.communityTheme,
        widgetBackground: state.widgetBackground,
        pageBackground: state.pageBackground,
        accentAlpha: state.accentAlpha,
        widgetAlpha: state.widgetAlpha,
        pageAlpha: state.pageAlpha,
      }),
      skipHydration: true,
    },
  ),
);

let hydrationStarted = false;

export function hydratePreferences() {
  if (hydrationStarted) return;
  hydrationStarted = true;
  void usePreferencesStore.persist.rehydrate();
}

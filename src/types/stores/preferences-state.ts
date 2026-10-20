import type { BackgroundStyle } from "@/types/preferences/background-style";
import type { CommunityTheme } from "@/types/preferences/community-theme";
import type { Theme } from "@/types/preferences/theme";
import type { ThemeSettings } from "@/types/preferences/theme-settings";

export type PreferencesState = {
  theme: Theme;
  sidebarCollapsed: boolean;
  themeSettings: ThemeSettings;
  /** Coleção temática ativa (`null` = padrão da marca). */
  themeCollection: string | null;
  /** Quando a coleção foi escolhida neste dispositivo (conflito com a conta). */
  themeCollectionUpdatedAt: number | null;
  /**
   * Pacote do tema da galeria que está em `themeCollection`.
   *
   * A coleção é derivada dele na hora, então o pacote é o que sobrevive ao reload: sem ele, o
   * id da galeria não tem o que resolver e o tema cai no padrão da marca.
   */
  communityTheme: CommunityTheme | null;
  /** Cor de widget escolhida (cartões/painéis/menus); `null` = do tema ou da marca. */
  widgetBackground: BackgroundStyle | null;
  /** Plano de fundo da página (atrás de tudo); `null` = do tema ou da marca. */
  pageBackground: BackgroundStyle | null;
  /** Transparência do destaque (0–100; 100 = opaco). */
  accentAlpha: number;
  /** Transparência dos widgets; `null` = a nativa do tema (ou opaco). */
  widgetAlpha: number | null;
  /** Transparência da página; `null` = a nativa do tema (ou opaca). */
  pageAlpha: number | null;
  setTheme: (theme: Theme) => void;
  setThemeSettings: (settings: ThemeSettings) => void;
  resetThemeSettings: () => void;
  setThemeCollection: (collectionId: string | null) => void;
  setCommunityTheme: (theme: CommunityTheme | null) => void;
  setWidgetBackground: (style: BackgroundStyle | null) => void;
  setPageBackground: (style: BackgroundStyle | null) => void;
  setAccentAlpha: (alpha: number) => void;
  setWidgetAlpha: (alpha: number | null) => void;
  setPageAlpha: (alpha: number | null) => void;
  toggleSidebar: () => void;
};

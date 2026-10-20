import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { hydratePreferences, usePreferencesStore } from "@/stores/preferences.store";
import type { CommunityTheme } from "@/types/preferences/community-theme";

import { preferencesApi, themesApi } from "@/lib/api";
import { getSessionToken } from "@/lib/api-client";

import { applyThemeSettings } from "./apply-theme";
import { resolveThemeCollection } from "./build-collection-css";
import {
  hasCommunityTheme,
  isCommunityThemeId,
  registerCommunityTheme,
} from "./community-collection";
import { syncThemeCollection } from "./sync-theme-collection";

/**
 * Único ponto que leva modo (claro/escuro), coleção temática e personalização para o DOM.
 *
 * Fica no root para valer em qualquer rota — inclusive nas telas públicas, que
 * não renderizam o botão de tema.
 */
export function useThemeSync(): void {
  const theme = usePreferencesStore((state) => state.theme);
  const themeSettings = usePreferencesStore((state) => state.themeSettings);
  const themeCollection = usePreferencesStore((state) => state.themeCollection);
  const communityTheme = usePreferencesStore((state) => state.communityTheme);
  const widgetBackground = usePreferencesStore((state) => state.widgetBackground);
  const pageBackground = usePreferencesStore((state) => state.pageBackground);
  const accentAlpha = usePreferencesStore((state) => state.accentAlpha);
  const widgetAlpha = usePreferencesStore((state) => state.widgetAlpha);
  const pageAlpha = usePreferencesStore((state) => state.pageAlpha);

  useEffect(() => {
    hydratePreferences();
  }, []);

  useCommunityThemePackage(themeCollection, communityTheme);

  useEffect(() => {
    // O pacote precisa virar coleção ANTES de aplicar: é por aqui que um tema publicado
    // chega ao DOM (o id salvo no storage não carrega as cores junto).
    if (communityTheme) registerCommunityTheme(communityTheme);

    document.documentElement.classList.toggle("dark", theme === "dark");
    applyThemeSettings(
      themeSettings,
      theme,
      themeCollection,
      widgetBackground,
      pageBackground,
      accentAlpha,
      widgetAlpha,
      pageAlpha,
    );
  }, [
    theme,
    themeSettings,
    themeCollection,
    communityTheme,
    widgetBackground,
    pageBackground,
    accentAlpha,
    widgetAlpha,
    pageAlpha,
  ]);

  useThemeAccountSync();
}

/** Ids cuja busca já está em voo (ou já falhou): um pacote não é pedido duas vezes por sessão. */
const requestedPackages = new Set<string>();

/**
 * Busca o pacote de um tema da galeria quando só se tem o id dele.
 *
 * É o caminho de quem entra em outro dispositivo: a conta guarda o id (o backend aceita e
 * confere o que está publicado), mas as cores ficam no pacote — sem ele, o id não resolve e o
 * app cairia no padrão da marca na frente da pessoa.
 */
function useCommunityThemePackage(
  themeCollection: string | null,
  communityTheme: CommunityTheme | null,
): void {
  const setCommunityTheme = usePreferencesStore((state) => state.setCommunityTheme);

  useEffect(() => {
    if (!themeCollection || !isCommunityThemeId(themeCollection)) return;
    if (communityTheme?.id === themeCollection || hasCommunityTheme(themeCollection)) return;
    if (requestedPackages.has(themeCollection)) return;
    requestedPackages.add(themeCollection);

    void themesApi
      .get(themeCollection)
      .then((theme) =>
        setCommunityTheme({
          id: theme.id,
          name: theme.name,
          modeDefault: theme.modeDefault,
          packageJson: theme.packageJson,
        }),
      )
      .catch(() => {
        // Tema escondido ou removido: fica o padrão da marca, e a próxima escolha sobe de novo.
        requestedPackages.delete(themeCollection);
      });
  }, [themeCollection, communityTheme, setCommunityTheme]);
}

/**
 * Recupera o tema salvo na conta ao entrar.
 *
 * A regra é **quem escreveu por último ganha**, comparando a data das duas escolhas. Antes era
 * "a conta ganha" sempre, e isso engolia a escolha do dispositivo quando o envio para a conta
 * falhava (foi o que aconteceu enquanto a API estava fora: o tema voltava ao antigo a cada
 * recarga, mesmo tendo sido trocado aqui). Sem data na conta (nunca escolheu) ou com um
 * identificador que o front não conhece, o local vale e sobe.
 *
 * Convidado não chega aqui: sem sessão, a preferência é só local mesmo.
 */
function useThemeAccountSync(): void {
  const token = getSessionToken();
  const themeCollection = usePreferencesStore((state) => state.themeCollection);
  const themeCollectionUpdatedAt = usePreferencesStore((state) => state.themeCollectionUpdatedAt);
  const setThemeCollection = usePreferencesStore((state) => state.setThemeCollection);

  const { data } = useQuery({
    queryKey: ["me", "theme"],
    queryFn: () => preferencesApi.getTheme(),
    enabled: Boolean(token),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!token || data === undefined) return;

    // Id de galeria vale mesmo sem o pacote em mãos: `useCommunityThemePackage` busca as cores
    // pelo id. Um hardcoded desconhecido (tema removido) continua valendo como ausência.
    const fromAccount = isCommunityThemeId(data.theme)
      ? data.theme
      : (resolveThemeCollection(data.theme)?.id ?? null);
    if (fromAccount === themeCollection) return;

    const accountAt = data.updatedAt ? Date.parse(data.updatedAt) : 0;
    const localAt = themeCollectionUpdatedAt ?? 0;

    if (fromAccount && accountAt > localAt) {
      setThemeCollection(fromAccount);
      return;
    }
    if (themeCollection) {
      // O daqui é mais novo (ou a conta não tem nada): sobe, em vez de aceitar o valor antigo.
      void syncThemeCollection(themeCollection);
    }
  }, [token, data, themeCollection, themeCollectionUpdatedAt, setThemeCollection]);
}

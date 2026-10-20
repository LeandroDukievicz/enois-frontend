import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { DEFAULT_THEME_SETTINGS } from "@/constants/theme-defaults";
import { usePreferencesStore } from "@/stores/preferences.store";
import { texts } from "@/texts";
import type { CommunityTheme } from "@/types/preferences/community-theme";
import { Palette, ShieldAlert } from "lucide-react";

import { themesApi } from "@/lib/api";
import type { ThemeGalleryItem } from "@/lib/api/themes";
import { requireAuth } from "@/lib/require-auth";
import { registerCommunityTheme } from "@/lib/theme/community-collection";
import { syncThemeCollection } from "@/lib/theme/sync-theme-collection";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/temas")({
  head: () => ({ meta: [{ title: texts.themeGallery.seoTitle }] }),
  component: Galeria,
});

/** Miniatura real: renderiza os tokens do pacote (fundo, superfície, destaque). */
function Miniatura({ packageJson }: { packageJson: string }) {
  let bg = "#f5f5f5",
    surface = "#ffffff",
    primary = "#7c3aed";
  try {
    const palette = JSON.parse(packageJson).palette;
    bg = palette.background ?? bg;
    surface = palette.surface ?? surface;
    primary = palette.primary ?? primary;
  } catch {
    // pacote invalido não chega aqui (o backend valida), mas o preview não pode quebrar
  }

  return (
    <div
      className="h-16 w-full rounded-md border border-border-soft p-1.5"
      style={{ background: bg }}
    >
      <div
        className="flex h-full flex-col justify-center gap-1 rounded-sm p-1.5"
        style={{ background: surface }}
      >
        <div className="h-1.5 w-2/3 rounded-full" style={{ background: primary }} />
        <div className="h-1 w-full rounded-full opacity-60" style={{ background: primary }} />
        <div className="mt-0.5 h-1 w-3/5 rounded-full opacity-40" style={{ background: primary }} />
      </div>
    </div>
  );
}

function Galeria() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const setThemeSettings = usePreferencesStore((state) => state.setThemeSettings);
  const setThemeCollection = usePreferencesStore((state) => state.setThemeCollection);
  const setCommunityTheme = usePreferencesStore((state) => state.setCommunityTheme);

  const { data, isLoading } = useQuery({
    queryKey: ["theme-gallery"],
    queryFn: () => themesApi.list(60),
  });

  const install = useMutation({
    mutationFn: (themeId: string) => themesApi.install(themeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["theme-gallery"] });
    },
  });

  const report = useMutation({
    mutationFn: (themeId: string) => themesApi.report(themeId),
    onSuccess: () => toast("Denúncia registrada. Obrigada por cuidar da rede.", "success"),
    onError: () => toast("Não foi possível denunciar.", "error"),
  });

  const themes = data ?? [];

  /**
   * Aplica um pacote publicado como coleção de verdade: o palette inteiro vira token CSS pelo
   * mesmo caminho dos temas da coleção.
   *
   * As cores livres voltam ao padrão da marca de propósito. O destaque livre é uma CAMADA que
   * pinta por cima de qualquer tema — e era justamente ele que engolia o `primary` publicado:
   * quem aplicava um tema da galeria ficava com o destaque dele salvo, e os temas seguintes
   * apareciam todos na mesma cor. Aqui, o primário do autor é o primário na tela até a pessoa
   * mexer nos sliders.
   */
  const apply = (theme: ThemeGalleryItem) => {
    const community: CommunityTheme = {
      id: theme.id,
      name: theme.name,
      modeDefault: theme.modeDefault,
      packageJson: theme.packageJson,
    };
    if (!registerCommunityTheme(community)) {
      toast("Este tema não pode ser aplicado: o pacote dele não é válido.", "error");
      return;
    }

    install.mutate(theme.id);
    setCommunityTheme(community);
    setThemeSettings(DEFAULT_THEME_SETTINGS);
    setThemeCollection(theme.id);
    setTheme(theme.modeDefault === "dark" ? "dark" : "light");
    // O cache da conta acompanha na hora (sem isto, um refetch traria o tema antigo).
    queryClient.setQueryData(["me", "theme"], { theme: theme.id });
    void syncThemeCollection(theme.id);
    toast("Tema aplicado!", "success");
  };

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Temas da comunidade</h1>

          <p className="text-sm text-muted-foreground">
            Temas criados pela própria rede, feitos só de cores — sem CSS livre, sem imagens.
            Instalar aplica na hora e você volta ao seu tema quando quiser. Quer vender os seus?{" "}
            <Link to="/marketplace" className="text-primary-text hover:underline">
              Marketplace
            </Link>
            .
          </p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : themes.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-surface-card">
            <EmptyState icon={Palette} title="Nenhum tema publicado ainda." />

            <p className="pb-6 text-center text-xs text-text-subtle">
              Personalize o seu no menu de aparência e publique aqui.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {themes.map((theme) => (
              <li key={theme.id} className="surface-card space-y-2 p-4">
                <Miniatura packageJson={theme.packageJson} />

                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-text-strong">{theme.name}</h3>

                  <span className="ml-auto shrink-0 text-[11px] text-text-subtle">
                    {theme.installs} {theme.installs === 1 ? "instalação" : "instalações"}
                  </span>
                </div>

                {theme.description && (
                  <p className="text-xs text-text-subtle">{theme.description}</p>
                )}

                <div className="flex items-center gap-2">
                  <Button size="sm" className="rounded-full" onClick={() => apply(theme)}>
                    Aplicar
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive"
                    onClick={() => report.mutate(theme.id)}
                    disabled={report.isPending}
                  >
                    Denunciar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppContainer>
  );
}

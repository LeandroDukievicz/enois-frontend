/**
 * Especificação compacta de uma paleta; o que não é declarado é derivado.
 *
 * A derivação usa `color-mix()` — CSS, não JavaScript — então o registro continua
 * sendo só dados e o navegador faz a conta (regra da casa: nada de simular em JS
 * o que o CSS resolve).
 *
 * ## Contrato
 *
 * Este tipo é a fonte da verdade do `palette` de um pacote publicado na galeria. O
 * validador do backend (`ThemeGalleryService.validatePackageJson`) confere a mesma
 * lista e recusa o que faltar: as obrigatórias não têm derivação segura, e as
 * opcionais entram em `hexToRgb()`/`corSobre()` sem guarda — uma cor fora do formato
 * não degrada o tema, ela quebra a aplicação inteira.
 *
 * - **Obrigatórias:** `background`, `surface`, `muted`, `border`, `primary`,
 *   `onPrimary`, `text.strong`, `text.subtle`, `text.date`.
 * - **Cor:** sempre hex de 6 dígitos (`#rrggbb`). `gradient` aceita apenas
 *   `linear-gradient(Ndeg, #rrggbb, #rrggbb)`.
 * - **`extra`** é a saída de emergência dos temas hardcoded da coleção (relevos que
 *   precisam de um token próprio). Um pacote da galeria não deve usá-la: o que ele
 *   declarar aqui não é validado nem auditado.
 *
 * `muted` merece atenção: é dele que saem `--muted` e `--surface-2`, e `--surface-2`
 * é o fundo do item selecionado da navegação lateral.
 */
export type PaletteSpec = {
  background: string;
  /** Cartões, painéis, popovers. */
  surface: string;
  /** Blocos alternativos, hovers, linhas. */
  muted: string;
  border: string;
  input?: string;
  primary: string;
  onPrimary: string;
  soft?: string;
  secondary?: string;
  onSecondary?: string;
  accent?: string;
  onAccent?: string;
  ring?: string;
  gradient?: string;
  shadows?: { soft?: string; card?: string };
  radius?: string;
  fontSans?: string;
  /** O tema é dono da leitura: texto explícito em toda paleta, com contraste conferido. */
  text: { strong: string; subtle: string; date: string };
  /** Transparência nativa das superfícies do tema (Aero 55, Frutiger 72; resto opaco). */
  surfaceAlpha?: number;
  extra?: Record<string, string>;
};

/**
 * Pacote publicado na galeria da comunidade, do jeito que a API devolve.
 *
 * É o dado bruto que fica salvo no dispositivo: o `packageJson` é a fonte do tema, e a
 * coleção aplicada é derivada dele na hora — nunca gravada por fora, para não haver duas
 * versões do mesmo tema em conflito. O palette do pacote segue o contrato de
 * `PaletteSpec` (a mesma fonte da verdade dos temas hardcoded da coleção).
 */
export type CommunityTheme = {
  /** Id cru da galeria (`theme_<32 hex>`) — é o mesmo valor que a conta guarda. */
  id: string;
  name: string;
  modeDefault: string;
  packageJson: string;
};

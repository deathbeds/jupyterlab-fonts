import {Token} from '@phosphor/coreutils';

import {Menu} from '@phosphor/widgets';

// tslint:disable-next-line
export const IFontManager = new Token<IFontManager>(
  '@deathbeds/jupyterlab-fonts:IFontManager'
);

export interface IFontManager {
  registerCodeFont(fontFamily: string, variants?: string[]): void;
  styles: HTMLStyleElement[];
  menus: Menu[];
  codeFontFamily: string;
}

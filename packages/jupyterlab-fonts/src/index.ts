import {Token} from '@phosphor/coreutils';
import {CommandRegistry} from '@phosphor/commands';
import {ICommandPalette} from '@jupyterlab/apputils';
import {INotebookTracker} from '@jupyterlab/notebook';

import {Menu} from '@phosphor/widgets';

import '../style/index.css';

// tslint:disable-next-line
const pkg = require('../package.json');

export const PACKAGE_NAME: string = pkg.name;
export const ICON_CLASS = 'jp-FontsIcon';

export const CMD_EDIT_FONTS = 'font-editor:open';

// tslint:disable-next-line
export const IFontManager = new Token<IFontManager>(
  '@deathbeds/jupyterlab-fonts:IFontManager'
);

export interface IFontManagerConstructor {
  new (
    commands: CommandRegistry,
    palette: ICommandPalette,
    notebooks: INotebookTracker
  ): IFontManager;
}

export interface IFontManager {
  registerFont(fontFamily: string, variants?: string[]): void;
  fonts: Map<string, string[]>;
  styles: HTMLStyleElement[];
  menus: Menu[];
}

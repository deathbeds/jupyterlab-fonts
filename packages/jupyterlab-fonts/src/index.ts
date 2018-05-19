import {Token} from '@phosphor/coreutils';
import {CommandRegistry} from '@phosphor/commands';
import {ICommandPalette} from '@jupyterlab/apputils';
import {INotebookTracker} from '@jupyterlab/notebook';

import {Menu} from '@phosphor/widgets';

import '../style/index.css';

export const CMD = {
  code: {
    fontSize: 'code-font-size',
    fontFamily: 'code-font-family',
    lineHeight: 'code-line-height',
  },
  editFonts: 'font-editor:open',
};

export const CSS = {
  root: ':root',
  code: {
    fontFamily: '--jp-code-font-family',
    fontSize: '--jp-code-font-size',
    lineHeight: '--jp-code-line-height',
  },
};

export const DEFAULT = {
  code: {
    fontSize: '13px',
    lineHeight: '1',
    fontFamily: '"Source Code Pro", monospace',
  },
};

// tslint:disable-next-line
const pkg = require('../package.json');

export const PACKAGE_NAME: string = pkg.name;
export const ICON_CLASS = 'jp-FontsIcon';

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
  menu: Menu;
}

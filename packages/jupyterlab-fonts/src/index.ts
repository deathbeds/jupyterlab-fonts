import {Token} from '@phosphor/coreutils';
import {CommandRegistry} from '@phosphor/commands';
import {ICommandPalette} from '@jupyterlab/apputils';
import {INotebookTracker, NotebookPanel} from '@jupyterlab/notebook';

import {Menu} from '@phosphor/widgets';

import * as SCHEMA from './schema';

import '../style/index.css';

// tslint:disable-next-line
const pkg = require('../package.json');

export type Scope = 'global' | 'notebook';

export enum TextKind {
  code = 'code',
  ui = 'ui',
}

export type TextProperty = 'font-family' | 'font-size' | 'line-height';

export const CMD = {
  code: {
    fontSize: 'code-font-size',
    fontFamily: 'code-font-family',
    lineHeight: 'code-line-height',
  },
  editFonts: 'font-editor:open',
};

export const ROOT = ':root';

export type ICSSVars = {[key in TextKind]: {[key in TextProperty]: SCHEMA.ICSSOM}};

export const CSS: ICSSVars = {
  code: {
    'font-family': '--jp-code-font-family',
    'font-size': '--jp-code-font-size',
    'line-height': '--jp-code-line-height',
  },
  ui: {
    'font-family': '--jp-ui-font-family',
    'font-size': '--jp-ui-font-size',
    'line-height': '--jp-ui-line-height',
  },
};

export type ICSSTextOptions = {
  [key in TextProperty]: (manager: IFontManager) => SCHEMA.ICSSOM[]
};

export const TEXT_OPTIONS: ICSSTextOptions = {
  'font-size': (m) => Array.from(Array(25).keys()).map((i) => `${i + 8}px`),
  'line-height': (m) => Array.from(Array(8).keys()).map((i) => `${i * 0.25 + 1}`),
  'font-family': (m) => {
    return Array.from(m.fonts.values()).reduce((m, f) => [...m, ...f]);
  },
};

export type ICSSTextLabels = {[key in TextProperty]: string};

export const TEXT_LABELS: ICSSTextLabels = {
  'font-size': 'Size',
  'line-height': 'Line Height',
  'font-family': 'Font',
};

export const DEFAULT = {
  code: {
    fontSize: '13px',
    lineHeight: '1',
    fontFamily: '"Source Code Pro", monospace',
  },
};

export const PACKAGE_NAME: string = pkg.name;
export const ICON_CLASS = 'jp-FontsIcon';
export const CONFIGURED_CLASS = 'jp-fonts-configured';

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
  stylesheets: HTMLStyleElement[];
  menu: Menu;
  getVarName(property: TextProperty, options: ITextStyleOptions): SCHEMA.ICSSOM;
  getTextStyle(property: TextProperty, options: ITextStyleOptions): SCHEMA.ICSSOM;
  setTextStyle(
    property: TextProperty,
    value: SCHEMA.ICSSOM,
    options: ITextStyleOptions
  ): void;
}

export interface ITextStyleOptions {
  kind: TextKind;
  scope?: Scope;
  notebook?: NotebookPanel;
}

import * as JSS from 'jss';
import {PromiseDelegate} from '@phosphor/coreutils';
// import {Base64} from 'js-base64';
import {Menu} from '@phosphor/widgets';
import {CommandRegistry} from '@phosphor/commands';
import {ICommandPalette} from '@jupyterlab/apputils';
import {INotebookTracker, NotebookPanel} from '@jupyterlab/notebook';

import {ISettingRegistry} from '@jupyterlab/coreutils';
import jssPresetDefault from 'jss-preset-default';

import {
  IFontManager,
  PACKAGE_NAME,
  CSS,
  CMD,
  TextProperty,
  ITextStyleOptions,
  TextKind,
  ROOT,
  TEXT_OPTIONS,
  FONT_FORMATS,
  FontFormat,
  IFontFaceOptions,
} from '.';

import * as SCHEMA from './schema';

const ALL_PALETTE = 'Fonts';

const PALETTE = {
  code: 'Fonts (Code)',
  content: 'Fonts (Content)',
};

export class FontManager implements IFontManager {
  private _globalStyles: HTMLStyleElement;
  private _fontFamilyMenus = new Map<TextKind, Menu>();
  private _fontSizeMenus = new Map<TextKind, Menu>();
  private _lineHeightMenus = new Map<TextKind, Menu>();
  private _menu: Menu;
  private _palette: ICommandPalette;
  private _commands: CommandRegistry;
  private _notebooks: INotebookTracker;
  private _jss = JSS.create(jssPresetDefault());
  private _notebookStyles = new Map<string, HTMLStyleElement>();
  private _fonts = new Map<string, IFontFaceOptions>();
  private _ready = new PromiseDelegate<void>();

  private _settings: ISettingRegistry.ISettings;

  constructor(
    commands: CommandRegistry,
    palette: ICommandPalette,
    notebooks: INotebookTracker
  ) {
    this._commands = commands;
    this._palette = palette;
    this._notebooks = notebooks;

    this._globalStyles = document.createElement('style');

    this._notebooks.currentChanged.connect(this._onNotebooksChanged, this);

    this.makeMenus(commands);
    this.makeCommands();

    this.hack();
  }

  get ready() {
    return this._ready.promise;
  }

  getVarName(property: TextProperty, {kind}: Partial<ITextStyleOptions>) {
    return CSS[kind][property];
  }

  getTextStyle(property: TextProperty, {scope, kind, notebook}: ITextStyleOptions) {
    if (!notebook && !this.settings) {
      return null;
    }

    try {
      const styles: SCHEMA.IStyles = notebook
        ? (notebook.model.metadata.get(PACKAGE_NAME) as any).styles
        : (this._settings.get('styles').composite as any);
      let varName = this.getVarName(property, {kind});
      return styles[ROOT][varName as any];
    } catch (err) {
      return null;
    }
  }

  async setTextStyle(
    property: TextProperty,
    value: SCHEMA.ICSSOM,
    {scope, kind, notebook}: ITextStyleOptions
  ): Promise<void> {
    if (!notebook && !this.settings) {
      return null;
    }
    let oldStyles: SCHEMA.IStyles;

    try {
      oldStyles = notebook
        ? (notebook.model.metadata.get(PACKAGE_NAME) as any).styles
        : (this._settings.get('styles').composite as any);
    } catch (err) {
      oldStyles = {};
    }

    let styles: SCHEMA.IStyles = JSON.parse(JSON.stringify(oldStyles || {}));
    let root = (styles[ROOT] = styles[ROOT] ? styles[ROOT] : {});
    let varName = this.getVarName(property, {kind});

    if (value == null) {
      delete root[varName as any];
    } else {
      root[varName as any] = value;
    }

    if (notebook) {
      let metadata = (notebook.model.metadata.get(PACKAGE_NAME) ||
        {}) as SCHEMA.ISettings;
      metadata = JSON.parse(JSON.stringify(metadata));
      metadata.styles = styles;
      switch (property) {
        case 'font-family':
          await this.embedFont(value, metadata);
          break;
        default:
          break;
      }
      this.cleanMetadata(metadata);
      notebook.model.metadata.set(PACKAGE_NAME, metadata as any);
    } else {
      this._settings.set('styles', styles);
    }
  }

  cleanMetadata(metadata: SCHEMA.ISettings) {
    const rawStyle = JSON.stringify(metadata.styles, null, 2);
    const oldFonts = Object.keys(metadata.fonts || {});
    for (let fontFamily of oldFonts) {
      let pattern = `'${fontFamily}'`;
      if (rawStyle.indexOf(pattern) === -1) {
        delete metadata.fonts[fontFamily];
      }
    }
  }

  async embedFont(fontFamily: SCHEMA.ICSSOM, metadata: SCHEMA.ISettings) {
    const unquoted = (fontFamily as string).replace(/(['"]?)(.*)\1/, '$2');
    const registered = this._fonts.get(unquoted);
    if (!registered) {
      return;
    }
    try {
      const faces = await registered.faces();
      const oldFaces = (metadata.fonts || {}) as SCHEMA.IFontFaceObject;
      oldFaces[unquoted] = faces;
      metadata.fonts = oldFaces;
    } catch (err) {
      console.warn('error embedding font');
      console.warn(err);
    }
  }

  get fonts() {
    return this._fonts;
  }

  private _onNotebooksChanged() {
    this._notebooks.forEach((notebook) => {
      if (this._notebookStyles.has(notebook.id)) {
        return;
      }
      this._registerNotebook(notebook);
    });
  }

  private _registerNotebook(notebook: NotebookPanel) {
    const id = notebook.id;
    this._notebookStyles.set(id, document.createElement('style'));
    let watcher = this._notebookMetaWatcher(id);

    notebook.model.metadata.changed.connect(watcher);
    notebook.disposed.connect(() => this._notebookStyles.delete(id));
    watcher();
    this.hack();
  }

  private _notebookMetaWatcher(id: string) {
    return () => {
      this._notebooks.forEach((notebook) => {
        if (notebook.id !== id) {
          return;
        }
        const meta = notebook.model.metadata.get(PACKAGE_NAME) as SCHEMA.ISettings;
        let newStyle = '';

        if (meta) {
          let jss: any = {'@font-face': [], '@global': {}};
          let idStyles: any = (jss['@global'][`#${id}`] = {});

          if (meta.fonts) {
            for (let fontFamily in meta.fonts) {
              jss['@font-face'] = jss['@font-face'].concat(meta.fonts[fontFamily]);
            }
          }

          let styles = meta.styles || {};
          for (let k in styles) {
            if (k === ROOT) {
              for (let rootK in styles[k]) {
                idStyles[rootK] = styles[k][rootK];
              }
            } else if (typeof styles[k] === 'object') {
              idStyles[`& ${k}`] = styles[k];
            } else {
              idStyles[k] = styles[k];
            }
          }
          const style = this._jss.createStyleSheet(jss);
          newStyle = style.toString();
        }

        const sheet = this._notebookStyles.get(id);
        if (sheet.textContent !== newStyle) {
          sheet.textContent = newStyle;
          this.hack();
        }
      });
    };
  }

  fontSizeOptions() {
    return Array.from(Array(25).keys()).map((i) => `${i + 8}px`);
  }

  fontSizeCommands(prefix: string) {
    return this.fontSizeOptions().map((px) => `${prefix}:${px}`);
  }

  makeCommands() {
    [TextKind.code, TextKind.content].map((kind) => {
      ['Increase', 'Decrease'].map((label, i) => {
        let command = `${CMD[kind].fontSize}:${label.toLowerCase()}`;
        this._commands.addCommand(command, {
          label: `${label} Code Font Size`,
          execute: () => {
            let oldSize = this.getTextStyle('font-size', {kind}) as string;
            let cfs = parseInt((oldSize || '0').replace(/px$/, ''), 10) || 13;
            this.setTextStyle('font-size', `${cfs + (i ? -1 : 1)}px`, {
              kind: TextKind.code,
            });
          },
          isVisible: () => this.enabled,
          mnemonic: 0,
        });
        this._fontSizeMenus.get(kind).addItem({command});
        this._palette.addItem({command, category: PALETTE[kind], rank: 0});
      });

      TEXT_OPTIONS['line-height'](this).map((lineHeight, i) => {
        const command = `${CMD[kind].lineHeight}:${lineHeight}`;
        this._commands.addCommand(command, {
          label: `${lineHeight}`,
          isToggled: () => this.getTextStyle('line-height', {kind}) === lineHeight,
          isVisible: () => this.enabled,
          execute: () => this.setTextStyle('line-height', lineHeight, {kind}),
          mnemonic: 0,
        });
        this._lineHeightMenus.get(kind).addItem({command});
      });

      TEXT_OPTIONS['font-size'](this).map((px) => {
        const command = `${CMD[kind].fontSize}:${px}`;
        this._commands.addCommand(command, {
          label: `${px}`,
          isToggled: () => this.getTextStyle('font-size', {kind}) === px,
          isVisible: () => this.enabled,
          execute: () => this.setTextStyle('font-size', px, {kind}),
          mnemonic: 0,
        });
        this._fontSizeMenus.get(kind).addItem({command});
      });
    });

    ['Enable', 'Disable'].map((label, i) => {
      const command = `custom-fonts:${label.toLowerCase()}`;
      this._commands.addCommand(command, {
        label: `${label} Custom Fonts`,
        isVisible: () => this.enabled === !!i,
        execute: () => {
          if (!this._settings) {
            return;
          }
          this._settings.set('enabled', !i);
        },
      });
      this._palette.addItem({command, category: ALL_PALETTE});
    });
  }

  get enabled() {
    if (!this.settings) {
      return false;
    }
    return !!this._settings.get('enabled').composite;
  }

  makeMenus(commands: CommandRegistry) {
    this._menu = new Menu({commands});
    this._menu.title.label = 'Fonts';

    [TextKind.code, TextKind.content].map((kind) => {
      const submenu = new Menu({commands});
      const height = new Menu({commands});
      const family = new Menu({commands});
      const size = new Menu({commands});

      submenu.title.label = kind[0].toUpperCase() + kind.slice(1);
      height.title.label = 'Line Height';
      family.title.label = 'Family';
      size.title.label = 'Size';

      this._fontFamilyMenus.set(kind, family);
      this._lineHeightMenus.set(kind, height);
      this._fontSizeMenus.set(kind, size);

      [family, size, height].map((propMenu) => {
        submenu.addItem({type: 'submenu', submenu: propMenu});
      });

      this._menu.addItem({type: 'submenu', submenu});
    });

    this._menu.addItem({
      command: CMD.editFonts,
      args: {global: true},
    });
  }

  set settings(settings) {
    if (this._settings) {
      this._settings.changed.disconnect(this.settingsUpdate, this);
    }
    this._settings = settings;
    if (settings) {
      settings.changed.connect(this.settingsUpdate, this);
    }
    this.settingsUpdate();
  }

  get settings() {
    return this._settings;
  }

  get menu() {
    return this._menu;
  }

  get stylesheets() {
    return [this._globalStyles, ...Array.from(this._notebookStyles.values())];
  }

  settingsUpdate(): void {
    if (!this.enabled) {
      this._globalStyles.textContent = '';
      return;
    }

    const raw = this._settings.get('styles').composite;
    try {
      const style = this._jss.createStyleSheet({
        '@global': raw as any,
      });
      this._globalStyles.textContent = style.toString();
      this.hack();
    } catch (err) {
      console.error('Font rendering error');
      console.error(err);
    }
  }

  hack() {
    setTimeout(() => this.stylesheets.map((s) => document.body.appendChild(s)), 0);
    this._ready.resolve(void 0);
  }

  registerFontFace(options: IFontFaceOptions): void {
    this._fonts.set(options.name, options);
    this.registerFontCommands(options);
  }

  private registerFontCommands(options: IFontFaceOptions) {
    [TextKind.code, TextKind.content].forEach((kind) => {
      const slug = options.name.replace(/[^a-z\d]/gi, '-').toLowerCase();
      let command = `${CMD[kind].fontFamily}:${slug}`;
      this._commands.addCommand(command, {
        label: options.name,
        isToggled: () => {
          let cff = this.getTextStyle('font-family', {kind});
          return cff && `${cff}`.indexOf(options.name) > -1;
        },
        isVisible: () => this.enabled,
        execute: () => {
          this.setTextStyle('font-family', `'${options.name}'`, {kind});
        },
        mnemonic: 0,
      });
      this._fontFamilyMenus.get(kind).addItem({command});
      this._palette.addItem({command, category: PALETTE[kind]});
    });
  }

  dataURISrc(url: string, format = FontFormat.woff2): string {
    const pre = `data:${FONT_FORMATS[format]};charset=utf-8;base64`;
    const base64Font = base64Encode(getBinary(url));
    const post = `format('${format}')`;
    const src = `url('${pre},${base64Font}') ${post}`;
    return src;
  }
}

/* below from https://gist.github.com/viljamis/c4016ff88745a0846b94 */
function getBinary(url: string) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.overrideMimeType('text/plain; charset=x-user-defined');
  xhr.send(null);
  return xhr.responseText;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function base64Encode(str: string): string {
  let out = '';
  let i = 0;
  let len = str.length;
  let c1: number;
  let c2: number;
  let c3: number;

  // tslint:disable
  while (i < len) {
    c1 = str.charCodeAt(i++) & 0xff;
    if (i === len) {
      out += CHARS.charAt(c1 >> 2);
      out += CHARS.charAt((c1 & 0x3) << 4);
      out += '==';
      break;
    }
    c2 = str.charCodeAt(i++);
    if (i === len) {
      out += CHARS.charAt(c1 >> 2);
      out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
      out += CHARS.charAt((c2 & 0xf) << 2);
      out += '=';
      break;
    }
    c3 = str.charCodeAt(i++);
    out += CHARS.charAt(c1 >> 2);
    out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
    out += CHARS.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
    out += CHARS.charAt(c3 & 0x3f);
  }
  // tslint:enable
  return out;
}

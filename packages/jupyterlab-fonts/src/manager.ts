import {PromiseDelegate} from '@phosphor/coreutils';
import {Menu} from '@phosphor/widgets';
import {CommandRegistry} from '@phosphor/commands';
import {ICommandPalette} from '@jupyterlab/apputils';
import {INotebookTracker, NotebookPanel} from '@jupyterlab/notebook';

import {ISettingRegistry} from '@jupyterlab/coreutils';

import {Stylist} from './stylist';

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
  FontFormat,
  IFontFaceOptions,
} from '.';

import {dataURISrc} from './util';

import * as SCHEMA from './schema';

const ALL_PALETTE = 'Fonts';

const PALETTE = {
  code: 'Fonts (Code)',
  content: 'Fonts (Content)',
};

export class FontManager implements IFontManager {
  protected _stylist: Stylist;
  private _fontFamilyMenus = new Map<TextKind, Menu>();
  private _fontSizeMenus = new Map<TextKind, Menu>();
  private _lineHeightMenus = new Map<TextKind, Menu>();
  private _menu: Menu;
  private _palette: ICommandPalette;
  private _commands: CommandRegistry;
  private _notebooks: INotebookTracker;
  private _ready = new PromiseDelegate<void>();

  private _settings: ISettingRegistry.ISettings;

  constructor(
    commands: CommandRegistry,
    palette: ICommandPalette,
    notebooks: INotebookTracker
  ) {
    this._stylist = new Stylist();
    this._stylist.cacheUpdated.connect(
      this.settingsUpdate,
      this
    );
    this._commands = commands;
    this._palette = palette;
    this._notebooks = notebooks;

    this._notebooks.currentChanged.connect(
      this._onNotebooksChanged,
      this
    );

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
    const registered = this._stylist.fonts.get(unquoted);
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
    return this._stylist.fonts;
  }

  private _onNotebooksChanged() {
    let styled = this._stylist.notebooks();

    this._notebooks.forEach((notebook) => {
      if (styled.indexOf(notebook) === -1) {
        this._registerNotebook(notebook);
      }
    });
  }

  private _registerNotebook(notebook: NotebookPanel) {
    this._stylist.registerNotebook(notebook, true);
    let watcher = this._notebookMetaWatcher(notebook);
    notebook.model.metadata.changed.connect(watcher);
    notebook.disposed.connect(this._onNotebookDisposed);
    watcher();
    this.hack();
  }

  private _onNotebookDisposed(notebook: NotebookPanel) {
    this._stylist.registerNotebook(notebook, false);
  }

  private _notebookMetaWatcher(notebook: NotebookPanel) {
    return () => {
      this._notebooks.forEach((notebook) => {
        if (notebook.id !== notebook.id) {
          return;
        }
        const meta = notebook.model.metadata.get(PACKAGE_NAME) as SCHEMA.ISettings;
        if (meta) {
          this._stylist.stylesheet(meta, notebook);
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
      settings.changed.connect(
        this.settingsUpdate,
        this
      );
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
    return this._stylist.stylesheets;
  }

  settingsUpdate(): void {
    let meta: SCHEMA.ISettings = {
      styles: this._settings.get('styles').composite as SCHEMA.IStyles,
    };
    this._stylist.stylesheet(meta, null, true);
  }

  hack() {
    this._stylist.hack();
    this._ready.resolve(void 0);
  }

  registerFontFace(options: IFontFaceOptions): void {
    this._stylist.fonts.set(options.name, options);
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
      });
      this._fontFamilyMenus.get(kind).addItem({command});
      this._palette.addItem({command, category: PALETTE[kind]});
    });
  }

  async dataURISrc(url: string, format = FontFormat.woff2): Promise<string> {
    return await dataURISrc(url, format);
  }
}

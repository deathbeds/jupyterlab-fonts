import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { CommandRegistry } from '@lumino/commands';
import { PromiseDelegate, PartialJSONValue } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import { Menu } from '@lumino/widgets';

import * as compat from './labcompat';
import * as SCHEMA from './schema';
import { Stylist } from './stylist';
import {
  IFontManager,
  PACKAGE_NAME,
  CSS,
  CMD,
  TextProperty,
  ITextStyleOptions,
  TEXT_LABELS,
  TextKind,
  ROOT,
  TEXT_OPTIONS,
  FontFormat,
  IFontFaceOptions,
  KIND_LABELS,
} from './tokens';
import { dataURISrc } from './util';

const ALL_PALETTE = 'Fonts';

const PALETTE = {
  code: 'Fonts (Code)',
  content: 'Fonts (Content)',
  ui: 'Fonts (UI)',
};

export class FontManager implements IFontManager {
  protected _stylist: Stylist;
  readonly licensePaneRequested: ISignal<any, any> = new Signal<any, any>(this);
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
    notebooks: INotebookTracker,
  ) {
    this._stylist = new Stylist();
    this._stylist.cacheUpdated.connect(this.settingsUpdate, this);
    this._commands = commands;
    this._palette = palette;
    this._notebooks = notebooks;

    this._notebooks.currentChanged.connect(this._onNotebooksChanged, this);

    this.makeMenus(commands);
    this.makeCommands();

    this.hack();
  }

  get ready() {
    return this._ready.promise;
  }

  get fonts() {
    return this._stylist.fonts;
  }

  get enabled() {
    if (!this.settings) {
      return false;
    }
    const enabled = !!this._settings.get('enabled').composite;
    return enabled;
  }

  set enabled(enabled) {
    if (!this.settings) {
      return;
    }
    this._settings.set('enabled', enabled).then().catch(console.warn);
  }

  get menu() {
    return this._menu;
  }

  get stylesheets() {
    return this._stylist.stylesheets;
  }

  get settings() {
    return this._settings;
  }

  set settings(settings) {
    if (this._settings) {
      this._settings.changed.disconnect(this.settingsUpdate, this);
    }
    this._settings = settings;
    if (settings) {
      settings.changed.connect(this.settingsUpdate, this);
    }
    void this.settingsUpdate();
  }

  setTransientNotebookStyle(
    panel: NotebookPanel,
    style: SCHEMA.ISettings | null,
  ): void {
    this._stylist.setTransientNotebookStyle(panel, style);
  }

  getTransientNotebookStyle(panel: NotebookPanel): SCHEMA.ISettings | null {
    return this._stylist.getTransientNotebookStyle(panel);
  }

  public async dataURISrc(url: string, format = FontFormat.woff2): Promise<string> {
    return await dataURISrc(url, format);
  }

  registerFontFace(options: IFontFaceOptions): void {
    this._stylist.fonts.set(options.name, options);
    this.registerFontCommands(options);
  }

  getVarName(property: TextProperty, { kind }: Partial<ITextStyleOptions>) {
    if (kind == null) {
      return null;
    }
    return CSS[kind][property] || null;
  }

  getTextStyle(property: TextProperty, { kind, notebook }: ITextStyleOptions) {
    if (!notebook && !this.settings) {
      return null;
    }

    try {
      const styles: SCHEMA.IStyles = notebook?.model
        ? (compat.getPanelMetadata(notebook.model, PACKAGE_NAME) as any).styles
        : (this._settings.get('styles').composite as any);
      let varName = this.getVarName(property, { kind });
      if (styles != null) {
        const rootStyle = styles[ROOT];
        if (rootStyle == null) {
          return null;
        }
        return rootStyle[varName as any];
      }
    } catch (err) {
      //
    }
    return null;
  }

  async setTextStyle(
    property: TextProperty,
    value: SCHEMA.ICSSOM | null,
    { kind, notebook }: ITextStyleOptions,
  ): Promise<void> {
    if (!notebook && !this.settings) {
      return;
    }
    let oldStyles: SCHEMA.IStyles;

    const model = notebook?.model;

    try {
      if (model) {
        oldStyles = (compat.getPanelMetadata(model, PACKAGE_NAME) as any).styles;
      } else {
        oldStyles = this._settings.get('styles').user as any;
      }
    } catch (err) {
      oldStyles = {};
    }

    let styles: SCHEMA.IStyles = JSON.parse(JSON.stringify(oldStyles || {}));
    let root = (styles[ROOT] = styles[ROOT] ? styles[ROOT] : {});
    let varName = this.getVarName(property, { kind });

    if (root) {
      if (value == null) {
        delete root[varName as any];
      } else {
        root[varName as any] = value;
      }
    }

    if (notebook) {
      let metadata = (
        notebook.model
          ? compat.getPanelMetadata(notebook.model, PACKAGE_NAME) || {}
          : {}
      ) as SCHEMA.ISettings;
      metadata = JSON.parse(JSON.stringify(metadata));
      metadata.styles = styles;
      switch (property) {
        case 'font-family':
          if (value != null) {
            await this.embedFont(value, metadata);
          }
          break;
        default:
          break;
      }
      this.cleanMetadata(metadata);
      if (notebook.model) {
        compat.setPanelMetadata(notebook.model, PACKAGE_NAME, metadata as any);
      }
    } else {
      if (!Object.keys(styles[ROOT] || {}).length) {
        delete styles[ROOT];
      }
      try {
        await this._settings.set('styles', styles as PartialJSONValue);
      } catch (err) {
        console.warn(err);
      }
    }
  }

  cleanMetadata(metadata: SCHEMA.ISettings) {
    const rawStyle = JSON.stringify(metadata.styles, null, 2);
    const oldFonts = Object.keys(metadata.fonts || {});
    for (let fontFamily of oldFonts) {
      let pattern = `'${fontFamily}'`;
      if (rawStyle.indexOf(pattern) === -1) {
        if (metadata.fonts) {
          delete metadata.fonts[fontFamily];
        }
        if (metadata.fontLicenses) {
          delete metadata.fontLicenses[fontFamily];
        }
      }
    }
  }

  async embedFont(fontFamily: SCHEMA.ICSSOM, metadata: SCHEMA.ISettings) {
    if (fontFamily == null) {
      return;
    }
    const unquoted = (fontFamily as string).replace(/(['"]?)(.*)\1/, '$2');
    const registered = this._stylist.fonts.get(unquoted);
    if (!registered) {
      return;
    }
    try {
      const faces = await registered.faces();
      const oldFaces = (metadata.fonts || {}) as SCHEMA.IFontFaceObject;
      const oldLicenses = (metadata.fontLicenses || {}) as SCHEMA.IFontLicenseObject;
      oldFaces[unquoted] = faces;
      oldLicenses[unquoted] = {
        spdx: registered.license.spdx,
        name: registered.license.name,
        text: await registered.license.text(),
        holders: registered.license.holders,
      };
      metadata.fonts = oldFaces;
      metadata.fontLicenses = oldLicenses;
    } catch (err) {
      console.warn('error embedding font');
      console.warn(err);
    }
  }

  private _onNotebooksChanged() {
    let styled = this._stylist.notebooks();

    this._notebooks.forEach((notebook) => {
      if (styled.indexOf(notebook) === -1) {
        this._registerNotebook(notebook);
      }
    });
  }

  private _registerNotebook(panel: NotebookPanel) {
    this._stylist.registerNotebook(panel, true);
    let watcher = this._notebookMetaWatcher(panel);
    if (panel?.model) {
      compat.metadataSignal(panel.model).connect(watcher);
    }
    panel.disposed.connect(this._onNotebookDisposed, this);
    watcher();
    this.hack();
  }

  private _onNotebookDisposed(panel: NotebookPanel) {
    this._stylist.registerNotebook(panel, false);
  }

  private _notebookMetaWatcher(panel: NotebookPanel) {
    return () => {
      this._notebooks.forEach((notebook) => {
        if (notebook.id !== panel.id || !notebook.model) {
          return;
        }
        const meta = compat.getPanelMetadata(
          notebook.model,
          PACKAGE_NAME,
        ) as SCHEMA.ISettings;
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
    [TextKind.code, TextKind.content, TextKind.ui].forEach((kind) => {
      const sizeCmd = (CMD[kind] as any).fontSize;
      if (!sizeCmd) {
        ['Increase', 'Decrease'].map((label, i) => {
          let command = `${sizeCmd}:${label.toLowerCase()}`;
          this._commands.addCommand(command, {
            label: `${label} Code Font Size`,
            execute: async () => {
              let oldSize = this.getTextStyle('font-size', { kind }) as string;
              let cfs = parseInt((oldSize || '0').replace(/px$/, ''), 10) || 13;
              try {
                await this.setTextStyle('font-size', `${cfs + (i ? -1 : 1)}px`, {
                  kind,
                });
              } catch (err) {
                console.warn(err);
              }
            },
            isVisible: () => this.enabled,
          });
          this._fontSizeMenus.get(kind)?.addItem({ command });
          this._palette.addItem({ command, category: PALETTE[kind], rank: 0 });
        });
      }

      ['line-height', 'font-size', 'font-family'].forEach((prop: TextProperty) => {
        if (kind == TextKind.ui && prop !== 'font-family') {
          return;
        }
        const command = `${kind}-${prop}:-reset`;
        this._commands.addCommand(command, {
          label: `Default ${KIND_LABELS[kind]} ${TEXT_LABELS[prop]}`,
          execute: () => this.setTextStyle(prop, null, { kind }),
          isVisible: () => this.enabled,
          isToggled: () => this.getTextStyle(prop, { kind }) == null,
        });
      });

      if (kind !== TextKind.ui) {
        TEXT_OPTIONS['line-height'](this).forEach((lineHeight) => {
          const cmd = (CMD[kind] as any).lineHeight;
          if (!cmd) {
            return;
          }
          const command = `${cmd}:${lineHeight}`;
          this._commands.addCommand(command, {
            label: `${lineHeight}`,
            isToggled: () => this.getTextStyle('line-height', { kind }) === lineHeight,
            isVisible: () => this.enabled,
            execute: () => this.setTextStyle('line-height', lineHeight, { kind }),
          });
          this._lineHeightMenus.get(kind)?.addItem({ command });
        });

        TEXT_OPTIONS['font-size'](this).forEach((px) => {
          const cmd = (CMD[kind] as any).fontSize;
          if (!cmd) {
            return;
          }
          const command = `${cmd}:${px}`;
          this._commands.addCommand(command, {
            label: `${px}`,
            isToggled: () => this.getTextStyle('font-size', { kind }) === px,
            isVisible: () => this.enabled,
            execute: () => this.setTextStyle('font-size', px, { kind }),
          });
          this._fontSizeMenus.get(kind)?.addItem({ command });
        });
      }
    });

    ['Enable', 'Disable'].map((label, i) => {
      const command = `custom-fonts:${label.toLowerCase()}`;
      this._commands.addCommand(command, {
        label: `${label} Custom Fonts`,
        isVisible: () => this.enabled === !!i,
        execute: async () => {
          if (!this._settings) {
            return;
          }
          try {
            await this._settings.set('enabled', !i);
          } catch (err) {
            console.warn(err);
          }
        },
      });
      this._palette.addItem({ command, category: ALL_PALETTE });
    });
  }

  protected fontPropMenu(parent: Menu, kind: TextKind, property: TextProperty) {
    let menu = new Menu({ commands: parent.commands });
    menu.title.label = TEXT_LABELS[property];

    menu.addItem({ command: `${kind}-${property}:-reset` });

    menu.addItem({ type: 'separator' });

    parent.addItem({ type: 'submenu', submenu: menu });

    return menu;
  }

  protected makeMenus(commands: CommandRegistry) {
    this._menu = new Menu({ commands });
    this._menu.title.label = 'Fonts';

    [TextKind.code, TextKind.content, TextKind.ui].map((kind) => {
      const submenu = new Menu({ commands });
      submenu.title.label = KIND_LABELS[kind];
      this._menu.addItem({ type: 'submenu', submenu });

      if (CSS[kind]['font-family']) {
        this._fontFamilyMenus.set(
          kind,
          this.fontPropMenu(submenu, kind, 'font-family'),
        );
      }

      if (CSS[kind]['font-size']) {
        this._fontSizeMenus.set(kind, this.fontPropMenu(submenu, kind, 'font-size'));
      }

      if (CSS[kind]['line-height']) {
        this._lineHeightMenus.set(
          kind,
          this.fontPropMenu(submenu, kind, 'line-height'),
        );
      }
    });

    this._menu.addItem({
      command: CMD.editFonts,
      args: { global: true },
    });

    this._menu.addItem({
      command: CMD.customFonts.enable,
    });

    this._menu.addItem({
      command: CMD.customFonts.disable,
    });
  }

  async settingsUpdate(): Promise<void> {
    let meta: SCHEMA.ISettings = {
      styles: this._settings.get('styles').composite as SCHEMA.IStyles,
    };
    if (this.enabled && meta.styles && Object.keys(meta.styles).length) {
      await this._stylist.ensureJss();
      this._stylist.stylesheet(meta);
    } else {
      this._stylist.hack(false);
    }
  }

  private registerFontCommands(options: IFontFaceOptions) {
    [TextKind.code, TextKind.content, TextKind.ui].forEach((kind) => {
      const slug = options.name.replace(/[^a-z\d]/gi, '-').toLowerCase();
      let command = `${CMD[kind].fontFamily}:${slug}`;
      this._commands.addCommand(command, {
        label: options.name,
        isToggled: () => {
          let cff = this.getTextStyle('font-family', { kind });
          return `${cff}`.indexOf(`'${options.name}'`) > -1;
        },
        isVisible: () => this.enabled,
        execute: async () => {
          try {
            await this.setTextStyle('font-family', `'${options.name}'`, {
              kind,
            });
          } catch (err) {
            console.warn(err);
          }
        },
      });
      this._fontFamilyMenus.get(kind)?.addItem({ command });
      this._palette.addItem({ command, category: PALETTE[kind] });
    });
  }

  requestLicensePane(font: any) {
    (this.licensePaneRequested as Signal<any, void>).emit(font);
  }

  hack() {
    this._stylist.hack();
    this._ready.resolve(void 0);
  }
}

import {Menu} from '@phosphor/widgets';
import {CommandRegistry} from '@phosphor/commands';
import {ICommandPalette} from '@jupyterlab/apputils';
import {INotebookTracker, NotebookPanel} from '@jupyterlab/notebook';

import {ISettingRegistry} from '@jupyterlab/coreutils';
import * as JSS from 'jss';
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
} from '.';

import * as SCHEMA from './schema';

const ALL_PALETTE = 'Fonts';
const CODE_PALETTE = 'Fonts (Code)';

export class FontManager implements IFontManager {
  private _globalStyles: HTMLStyleElement;
  private _codeFontMenu: Menu;
  private _codeFontFamilyMenu: Menu;
  private _codeFontSizeMenu: Menu;
  private _codeLineHeightMenu: Menu;
  private _menu: Menu;
  private _palette: ICommandPalette;
  private _commands: CommandRegistry;
  private _notebooks: INotebookTracker;
  private _jss = JSS.create(jssPresetDefault());
  private _notebookStyles = new Map<string, HTMLStyleElement>();
  private _fonts = new Map<string, string[]>();

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

  setTextStyle(
    property: TextProperty,
    value: SCHEMA.ICSSOM,
    {scope, kind, notebook}: ITextStyleOptions
  ): void {
    console.log(property, value, scope, kind, notebook);
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
      let md = (notebook.model.metadata.get(PACKAGE_NAME) as any) || {};
      md = JSON.parse(JSON.stringify(md));
      md['styles'] = styles;
      notebook.model.metadata.set(PACKAGE_NAME, md);
    } else {
      this._settings.set('styles', styles);
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
        const meta = notebook.model.metadata.get(PACKAGE_NAME);
        let newStyle = '';

        if (meta) {
          let jss: any = {'@global': {}};
          let idStyles: any = (jss['@global'][`#${id}`] = {});
          let styles = (meta as any)['styles'] || {};
          for (let k in styles) {
            if (k === ROOT) {
              for (let rootK in styles[k]) {
                idStyles[rootK] = styles[k][rootK];
              }
            } else if (k === '@font-face') {
              jss[k] = styles[k];
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
    ['Increase', 'Decrease'].map((label, i) => {
      let command = `${CMD.code.fontSize}:${label.toLowerCase()}`;
      this._commands.addCommand(command, {
        label: `${label} Code Font Size`,
        execute: () => {
          let cfs = parseInt(
            (this.getTextStyle('font-size', {kind: TextKind.code}) as string).replace(
              /px$/,
              ''
            ),
            10
          );
          this.setTextStyle('font-size', `${cfs + (i ? -1 : 1)}px`, {
            kind: TextKind.code,
          });
        },
        isVisible: () => this.enabled,
        mnemonic: 0,
      });
      this._codeFontSizeMenu.addItem({command});
      this._palette.addItem({command, category: CODE_PALETTE, rank: 0});
    });

    TEXT_OPTIONS['line-height'](this).map((lineHeight, i) => {
      const command = `${CMD.code.lineHeight}:${lineHeight}`;
      this._commands.addCommand(command, {
        label: `${lineHeight}`,
        isToggled: () =>
          this.getTextStyle('line-height', {kind: TextKind.code}) === lineHeight,
        isVisible: () => this.enabled,
        execute: () =>
          this.setTextStyle('line-height', lineHeight, {kind: TextKind.code}),
        mnemonic: 0,
      });
      this._codeLineHeightMenu.addItem({command});
    });

    TEXT_OPTIONS['line-height'](this).map((px) => {
      const command = `${CMD.code.fontSize}:${px}`;
      this._commands.addCommand(command, {
        label: `${px}`,
        isToggled: () => this.getTextStyle('font-size', {kind: TextKind.code}) === px,
        isVisible: () => this.enabled,
        execute: () => this.setTextStyle('font-size', px, {kind: TextKind.code}),
        mnemonic: 0,
      });
      this._codeFontSizeMenu.addItem({command});
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
    const code = (this._codeFontMenu = new Menu({commands}));
    code.title.label = 'Code';

    const family = (this._codeFontFamilyMenu = new Menu({commands}));
    family.title.label = 'Family';

    const size = (this._codeFontSizeMenu = new Menu({commands}));
    size.title.label = 'Size';

    const height = (this._codeLineHeightMenu = new Menu({commands}));
    height.title.label = 'Line Height';

    [family, size, height].map((submenu) => code.addItem({type: 'submenu', submenu}));

    this._menu = new Menu({commands});
    this._menu.title.label = 'Fonts';

    this._menu.addItem({type: 'submenu', submenu: code});
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
  }

  registerFont(fontFamily: string, variants: string[] = []) {
    if (!variants.length) {
      variants = [fontFamily];
    } else {
      variants = variants.map((v) => `${fontFamily} ${v}`);
    }

    this._fonts.set(fontFamily, variants);

    variants.forEach((fontFamily) => {
      const slug = fontFamily.replace(/[^a-z\d]/gi, '-').toLowerCase();
      let command = `${CMD.code.fontFamily}:${slug}`;
      this._commands.addCommand(command, {
        label: fontFamily,
        isToggled: () => {
          let cff = this.getTextStyle('font-family', {kind: TextKind.code});
          return cff && `${cff}`.indexOf(fontFamily) > -1;
        },
        isVisible: () => this.enabled,
        execute: () => {
          this.setTextStyle('font-family', fontFamily, {kind: TextKind.code});
        },
        mnemonic: 0,
      });
      this._codeFontFamilyMenu.addItem({command});
      this._palette.addItem({command, category: CODE_PALETTE});
    });
  }
}

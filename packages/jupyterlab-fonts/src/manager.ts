import {Menu} from '@phosphor/widgets';
import {CommandRegistry} from '@phosphor/commands';
import {ICommandPalette} from '@jupyterlab/apputils';
import {INotebookTracker, NotebookPanel} from '@jupyterlab/notebook';

import {ISettingRegistry} from '@jupyterlab/coreutils';
import * as JSS from 'jss';
import jssPresetDefault from 'jss-preset-default';

import {IFontManager, PACKAGE_NAME, CSS, CMD, DEFAULT} from '.';

const ALL_PALETTE = 'Fonts';
const CODE_PALETTE = 'Fonts (Code)';

export class FontManager implements IFontManager {
  private _globalStyles: HTMLStyleElement;
  private _editorMenu: Menu;
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
            if (k === CSS.root) {
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
          console.group("FIXME: don't show this");
          console.log(jss);
          const style = this._jss.createStyleSheet(jss);
          newStyle = style.toString();
          console.log(newStyle);
          console.groupEnd();
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

  lineHeightOptions() {
    return Array.from(Array(8).keys()).map((i) => `${i * 0.25 + 1}`);
  }

  makeCommands() {
    ['Increase', 'Decrease'].map((label, i) => {
      let command = `${CMD.code.fontSize}:${label.toLowerCase()}`;
      this._commands.addCommand(command, {
        label: `${label} Code Font Size`,
        execute: () => {
          let cfs = parseInt(this.codeFontSize.replace(/px$/, ''), 10);
          this.codeFontSize = `${cfs + (i ? -1 : 1)}px`;
        },
        isVisible: () => this.enabled,
        mnemonic: 0,
      });
      this._codeFontSizeMenu.addItem({command});
      this._palette.addItem({command, category: CODE_PALETTE, rank: 0});
    });

    this.lineHeightOptions().map((lineHeight, i) => {
      const command = `${CMD.code.lineHeight}:${lineHeight}`;
      this._commands.addCommand(command, {
        label: lineHeight,
        isToggled: () => this.codeLineHeight === lineHeight,
        isVisible: () => this.enabled,
        execute: () => (this.codeLineHeight = lineHeight),
        mnemonic: 0,
      });
      this._codeLineHeightMenu.addItem({command});
    });

    this.fontSizeOptions().map((px) => {
      const command = `${CMD.code.fontSize}:${px}`;
      this._commands.addCommand(command, {
        label: px,
        isToggled: () => this.codeFontSize === px,
        isVisible: () => this.enabled,
        execute: () => (this.codeFontSize = px),
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
    const editor = (this._editorMenu = new Menu({commands}));
    editor.addItem({
      command: CMD.editFonts,
      args: {global: true},
    });
    editor.title.label = 'Customize Fonts';

    const code = (this._codeFontMenu = new Menu({commands}));
    code.title.label = 'Code Font';

    const family = (this._codeFontFamilyMenu = new Menu({commands}));
    family.title.label = 'Family';

    const size = (this._codeFontSizeMenu = new Menu({commands}));
    size.title.label = 'Size';

    const height = (this._codeLineHeightMenu = new Menu({commands}));
    height.title.label = 'Line Height';

    [family, size, height].map((submenu) => code.addItem({type: 'submenu', submenu}));

    this._menu = new Menu({commands});
    this._menu.title.label = 'Format';

    this._menu.addItem({type: 'submenu', submenu: code});
    this._menu.addItem({type: 'submenu', submenu: editor});
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

  get styles() {
    return [this._globalStyles, ...Array.from(this._notebookStyles.values())];
  }

  get codeFontFamily() {
    if (!this.settings) {
      return null;
    }
    try {
      return (this._settings.get('styles').composite as any)[CSS.root][
        CSS.code.fontFamily
      ];
    } catch (err) {
      return null;
    }
  }

  set codeFontFamily(fontFamily) {
    let styles: any = this._settings.get('styles').composite || {};
    if (!styles[CSS.root]) {
      styles[CSS.root] = {};
    }
    if (fontFamily) {
      styles[CSS.root][CSS.code.fontFamily] = `"${fontFamily}", ${
        DEFAULT.code.fontFamily
      }`;
    } else {
      delete styles[CSS.root][CSS.code.fontFamily];
    }
    this._settings.set('styles', styles);
  }

  get codeFontSize() {
    if (!this.settings) {
      return DEFAULT.code.fontSize;
    }
    try {
      return (this._settings.get('styles').composite as any)[CSS.root][
        CSS.code.fontSize
      ];
    } catch (err) {
      return DEFAULT.code.fontSize;
    }
  }

  set codeFontSize(fontSize) {
    let styles: any = this._settings.get('styles').composite || {};
    if (!styles[CSS.root]) {
      styles[CSS.root] = {};
    }
    if (fontSize) {
      styles[CSS.root][CSS.code.fontSize] = fontSize;
    } else {
      delete styles[CSS.root][CSS.code.fontSize];
    }
    this._settings.set('styles', styles);
  }

  get codeLineHeight() {
    if (!this.settings) {
      return DEFAULT.code.lineHeight;
    }
    try {
      return (this._settings.get('styles').composite as any)[CSS.root][
        CSS.code.lineHeight
      ];
    } catch (err) {
      return DEFAULT.code.lineHeight;
    }
  }

  set codeLineHeight(lineHeight) {
    let styles: any = this._settings.get('styles').composite || {};
    if (!styles[CSS.root]) {
      styles[CSS.root] = {};
    }
    if (lineHeight) {
      styles[CSS.root][CSS.code.lineHeight] = lineHeight;
    } else {
      delete styles[CSS.root][CSS.code.lineHeight];
    }
    this._settings.set('styles', styles);
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
    setTimeout(() => this.styles.map((s) => document.body.appendChild(s)), 0);
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
          let cff = this.codeFontFamily;
          return cff && cff.indexOf(fontFamily) > -1;
        },
        isVisible: () => this.enabled,
        execute: () => {
          this.codeFontFamily = fontFamily;
        },
        mnemonic: 0,
      });
      this._codeFontFamilyMenu.addItem({command});
      this._palette.addItem({command, category: CODE_PALETTE});
    });
  }
}

import {Menu} from '@phosphor/widgets';
import {CommandRegistry} from '@phosphor/commands';
import {ICommandPalette} from '@jupyterlab/apputils';

import {ISettingRegistry} from '@jupyterlab/coreutils';
import * as JSS from 'jss';
import jssPresetDefault from 'jss-preset-default';

import {IFontManager} from '.';

const ALL_PALETTE = 'Fonts';
const CODE_PALETTE = 'Fonts (Code)';

const CMD_CODE_FONT_SIZE = 'code-font-size';
const CMD_CODE_FONT_FAMILY = 'code-font-family';

const ROOT = ':root';
const CODE_FONT_FAMILY = '--jp-code-font-family';
const CODE_FONT_FAMILY_DEFAULT = '"Source Code Pro", monospace';
const CODE_FONT_SIZE = '--jp-code-font-size';
const CODE_FONT_SIZE_DEFAULT = '13px';

export class FontManager implements IFontManager {
  private _stylesheet: HTMLStyleElement;
  private _codeFontMenu: Menu;
  private _codeFontFamilyMenu: Menu;
  private _codeFontSizeMenu: Menu;
  private _palette: ICommandPalette;
  private _commands: CommandRegistry;
  private _jss = JSS.create(jssPresetDefault());

  private _settings: ISettingRegistry.ISettings;

  constructor(commands: CommandRegistry, palette: ICommandPalette) {
    this._commands = commands;
    this._palette = palette;

    this._stylesheet = document.createElement('style');

    this.makeMenus(commands);
    this.makeCommands();

    setTimeout(() => this.hack(), 0);
  }

  fontSizeOptions() {
    return Array.from(Array(25).keys()).map((i) => `${i + 8}px`);
  }

  fontSizeCommands(prefix: string) {
    return this.fontSizeOptions().map((px) => `${prefix}:${px}`);
  }

  makeCommands() {
    ['Increase', 'Decrease'].map((label, i) => {
      let command = `${CMD_CODE_FONT_SIZE}:${label.toLowerCase()}`;
      this._commands.addCommand(command, {
        label: `${label} Code Font Size`,
        execute: () => {
          let cfs = parseInt(this.codeFontSize, 10);
          this.codeFontSize = `${cfs + (i ? -1 : 1)}px`;
        },
        isVisible: () => this.enabled,
        mnemonic: 0,
      });
      this._codeFontSizeMenu.addItem({command});
      this._palette.addItem({command, category: CODE_PALETTE, rank: 0});
    });

    this.fontSizeOptions().map((px) => {
      const command = `${CMD_CODE_FONT_SIZE}:${px}`;
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
          this._settings.set('enabled', !i);
        },
      });
      this._palette.addItem({command, category: ALL_PALETTE});
    });
  }

  get enabled() {
    return !!this._settings.get('enabled').composite;
  }

  makeMenus(commands: CommandRegistry) {
    const code = (this._codeFontMenu = new Menu({commands}));
    code.title.label = 'Code Font';

    const family = (this._codeFontFamilyMenu = new Menu({commands}));
    family.title.label = 'Family';

    const size = (this._codeFontSizeMenu = new Menu({commands}));
    size.title.label = 'Size';

    [family, size].map((submenu) => code.addItem({type: 'submenu', submenu}));
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

  get menus() {
    return [this._codeFontMenu];
  }

  get styles() {
    return [this._stylesheet];
  }

  get codeFontFamily() {
    try {
      return (this._settings.get('styles').composite as any)[ROOT][CODE_FONT_FAMILY];
    } catch (err) {
      return null;
    }
  }

  set codeFontFamily(fontFamily) {
    let styles: any = this._settings.get('styles').composite || {};
    if (!styles[ROOT]) {
      styles[ROOT] = {};
    }
    if (fontFamily) {
      styles[ROOT][CODE_FONT_FAMILY] = `"${fontFamily}", ${CODE_FONT_FAMILY_DEFAULT}`;
    } else {
      delete styles[ROOT][CODE_FONT_FAMILY];
    }
    this._settings.set('styles', styles);
  }

  get codeFontSize() {
    try {
      return (this._settings.get('styles').composite as any)[ROOT][CODE_FONT_SIZE];
    } catch (err) {
      return CODE_FONT_SIZE_DEFAULT;
    }
  }

  set codeFontSize(fontSize) {
    let styles: any = this._settings.get('styles').composite || {};
    if (!styles[ROOT]) {
      styles[ROOT] = {};
    }
    if (fontSize) {
      styles[ROOT][CODE_FONT_SIZE] = fontSize;
    } else {
      delete styles[ROOT][CODE_FONT_SIZE];
    }
    this._settings.set('styles', styles);
  }

  settingsUpdate(): void {
    if (!this.enabled) {
      this._stylesheet.textContent = '';
      return;
    }

    const raw = this._settings.get('styles').composite;
    try {
      const style = this._jss.createStyleSheet({
        '@global': raw as any,
      });
      this._stylesheet.textContent = style.toString();
      this.hack();
    } catch (err) {
      console.error('Font rendering error');
      console.error(err);
    }
  }

  hack() {
    this.styles.map((s) => document.body.appendChild(s));
  }

  registerFont(fontFamily: string, variants: string[] = []) {
    if (!variants.length) {
      variants = [fontFamily];
    } else {
      variants = variants.map((v) => `${fontFamily} ${v}`);
    }

    variants.forEach((fontFamily) => {
      const slug = fontFamily.replace(/[^a-z\d]/gi, '-').toLowerCase();
      let command = `${CMD_CODE_FONT_FAMILY}:${slug}`;
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

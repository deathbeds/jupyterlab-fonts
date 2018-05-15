import {Menu} from '@phosphor/widgets';
import {CommandRegistry} from '@phosphor/commands';

import {ISettingRegistry} from '@jupyterlab/coreutils';
import * as jss from 'jss';

import {IFontManager} from '.';

export class FontManager implements IFontManager {
  private _codeFontFamily: string;
  private _codeStyle: HTMLStyleElement;
  private _codeFontMenu: Menu;
  private _commands: CommandRegistry;

  constructor(commands: CommandRegistry) {
    this._commands = commands;
    this._codeFontMenu = new Menu({commands});
    this._codeFontMenu.title.label = 'Code Font';
    this._codeStyle = document.createElement('style');
    setTimeout(() => this.hack(), 0);
  }

  get menus() {
    return [this._codeFontMenu];
  }

  get styles() {
    return [this._codeStyle];
  }

  get codeFontFamily() {
    this.hack();
    return this._codeFontFamily;
  }

  settingsUpdate(settings: ISettingRegistry.ISettings): void {
    const apiVersion = 1;
    // settings.get('version').composite as string | null | undefined;
    console.log(jss);
    console.log(apiVersion, settings);
  }

  hack() {
    this.styles.map((s) => document.body.appendChild(s));
  }

  set codeFontFamily(fontFamily) {
    this._codeFontFamily = fontFamily;
    this._codeStyle.textContent = `:root {--jp-code-font-family: "${fontFamily}";}`;
  }

  registerCodeFont(fontFamily: string, variants: string[] = []) {
    if (!variants.length) {
      variants = [fontFamily];
    } else {
      variants = variants.map((v) => `${fontFamily} ${v}`);
    }

    variants.forEach((fontFamily) => {
      let id = 'code-font:' + fontFamily.replace(/[^a-z\d]/gi, '-').toLowerCase();
      this._commands.addCommand(id, {
        label: `Use Code Font ${fontFamily}`,
        isToggled: () => this._codeFontFamily === fontFamily,
        execute: () => {
          this.codeFontFamily = fontFamily;
        },
      });
      this._codeFontMenu.addItem({command: id});
      return id;
    });
  }
}

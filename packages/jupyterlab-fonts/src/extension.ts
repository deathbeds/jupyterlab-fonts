import { JupyterLab, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import {
  IFontManager,
  PACKAGE_NAME,
  ICON_CLASS,
  CMD,
  IFontFaceOptions,
  LICENSE_ICON
} from '.';
import { FontManager } from './manager';
import { NotebookFontsButton } from './button';
import { FontEditor } from './editor';
import { LicenseViewer } from './license';

const PLUGIN_ID = `${PACKAGE_NAME}:fonts`;

let licenseId = 0;

const plugin: JupyterFrontEndPlugin<IFontManager> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [IMainMenu, ISettingRegistry, ICommandPalette, INotebookTracker],
  provides: IFontManager,
  activate: function(
    app: JupyterLab,
    menu: IMainMenu,
    settingRegistry: ISettingRegistry,
    palette: ICommandPalette,
    notebooks: INotebookTracker
  ): IFontManager {
    const manager = new FontManager(app.commands, palette, notebooks);

    manager.licensePaneRequested.connect((it, font: IFontFaceOptions) => {
      let license = new LicenseViewer({ font });
      license.id = `jp-fonts-license-${licenseId++}`;
      license.title.label = font.name;
      license.title.closable = true;
      license.title.icon = LICENSE_ICON;
      app.shell.add(license, 'main');
      app.shell.activateById(license.id);
    });

    menu.settingsMenu.addGroup([{ type: 'submenu', submenu: manager.menu }]);

    app.commands.addCommand(CMD.editFonts, {
      label: 'Global Fonts...',
      execute: args => {
        const editor = new FontEditor();
        const { model } = editor;
        model.fonts = manager;
        editor.title.icon = ICON_CLASS;
        editor.title.closable = true;
        if ((args || {})['global']) {
          editor.title.label = 'Global';
          editor.id = 'font-editor-global';
        } else {
          const { currentWidget } = notebooks;
          if (currentWidget == null) {
            return;
          }
          model.notebook = currentWidget;
          editor.id = `font-editor-${model.notebook.id}`;
          model.notebook.disposed.connect(() => editor.dispose());
        }

        app.shell.add(editor, 'main', { mode: 'split-right' });
      }
    });

    const fontsButton = new NotebookFontsButton();
    fontsButton.widgetRequested.connect(async () => {
      try {
        await app.commands.execute(CMD.editFonts);
      } catch (err) {
        console.warn(err);
      }
    });

    app.docRegistry.addWidgetExtension('Notebook', fontsButton);

    Promise.all([settingRegistry.load(PLUGIN_ID), app.restored])
      .then(async ([settings]) => {
        manager.settings = settings;
        settingRegistry
          .load('@jupyterlab/apputils-extension:themes')
          .then(settings => {
            settings.changed.connect(() => {
              setTimeout(() => manager.hack(), 100);
            });
          })
          .catch(console.warn);
      })
      .catch((reason: Error) => {
        console.error(reason);
      });

    return manager;
  }
};

export default plugin;

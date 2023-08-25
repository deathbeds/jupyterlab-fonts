import {
  JupyterFrontEndPlugin,
  JupyterFrontEnd,
  ILabShell,
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { NotebookFontsButton } from './button';
import { FontEditor } from './editor';
import { ICONS } from './icons';
import { LicenseViewer } from './license';
import { FontManager } from './manager';
import { IFontManager, PACKAGE_NAME, CMD, IFontFaceOptions } from './tokens';

import '../style/index.css';

const PLUGIN_ID = `${PACKAGE_NAME}:fonts`;

let licenseId = 0;

const plugin: JupyterFrontEndPlugin<IFontManager> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [IMainMenu, ISettingRegistry, ICommandPalette, INotebookTracker],
  optional: [ILabShell],
  provides: IFontManager,
  activate: function (
    app: JupyterFrontEnd,
    menu: IMainMenu,
    settingRegistry: ISettingRegistry,
    palette: ICommandPalette,
    notebooks: INotebookTracker,
    labShell?: ILabShell | null,
  ): IFontManager {
    const manager = new FontManager(app.commands, palette, notebooks);

    const area = labShell ? 'main' : 'right';

    manager.licensePaneRequested.connect((it, font: IFontFaceOptions) => {
      let license = new LicenseViewer({ font });
      license.id = `jp-fonts-license-${licenseId++}`;
      license.title.label = font.name;
      license.title.closable = true;
      license.title.icon = ICONS.license;
      app.shell.add(license, area);
      app.shell.activateById(license.id);
    });

    menu.settingsMenu.addGroup([{ type: 'submenu', submenu: manager.menu }]);

    app.commands.addCommand(CMD.editFonts, {
      label: 'Global Fonts...',
      execute: (args) => {
        const editor = new FontEditor();
        const { model } = editor;
        model.fonts = manager;
        editor.title.icon = ICONS.fonts;
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

        app.shell.add(editor, area, { mode: 'split-right' });
        app.shell.activateById(editor.id);
      },
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
          .then((settings) => {
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
  },
};

export default plugin;

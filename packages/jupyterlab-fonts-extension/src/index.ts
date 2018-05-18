import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IMainMenu} from '@jupyterlab/mainmenu';

import {ICommandPalette} from '@jupyterlab/apputils';

import {INotebookTracker} from '@jupyterlab/notebook';

import {
  IFontManager,
  PACKAGE_NAME,
  ICON_CLASS,
  CMD_EDIT_FONTS,
} from '@deathbeds/jupyterlab-fonts';
import {FontManager} from '@deathbeds/jupyterlab-fonts/lib/manager';
import {NotebookFontsButton} from '@deathbeds/jupyterlab-fonts/lib/button';
import {FontEditor, FontEditorModel} from '@deathbeds/jupyterlab-fonts/lib/editor';

import {ISettingRegistry} from '@jupyterlab/coreutils';

const PLUGIN_ID = `${PACKAGE_NAME}:fonts`;

const plugin: JupyterLabPlugin<IFontManager> = {
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

    menu.addMenu(manager.menu, {rank: 2});

    app.commands.addCommand(CMD_EDIT_FONTS, {
      label: 'Open Font Editor',
      execute: (args) => {
        const editor = new FontEditor();
        const model = (editor.model = new FontEditorModel());
        model.fonts = manager;
        editor.title.icon = ICON_CLASS;
        editor.title.closable = true;
        if ((args || {})['global']) {
          editor.title.label = 'Global';
          editor.id = 'font-editor-global';
        } else {
          model.notebook = notebooks.currentWidget;
          editor.id = `font-editor-${model.notebook.id}`;
          model.notebook.disposed.connect(() => editor.dispose());
        }

        app.shell.addToMainArea(editor, {mode: 'split-right'});
      },
    });

    const fontsButton = new NotebookFontsButton();
    fontsButton.widgetRequested.connect(() => {
      app.commands.execute(CMD_EDIT_FONTS);
    });

    app.docRegistry.addWidgetExtension('Notebook', fontsButton);

    Promise.all([settingRegistry.load(PLUGIN_ID), app.restored])
      .then(([settings]) => {
        manager.settings = settings;
        settingRegistry
          .load('@jupyterlab/apputils-extension:themes')
          .then((settings) => {
            settings.changed.connect(() => {
              setTimeout(() => manager.hack(), 100);
            });
          });
      })
      .catch((reason: Error) => {
        console.error(reason);
      });

    return manager;
  },
};

export default plugin;

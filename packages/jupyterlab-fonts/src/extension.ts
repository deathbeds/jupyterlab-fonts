import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IMainMenu} from '@jupyterlab/mainmenu';
import {ICommandPalette} from '@jupyterlab/apputils';
import {INotebookTracker} from '@jupyterlab/notebook';
import {ISettingRegistry} from '@jupyterlab/coreutils';



import {IFontManager, PACKAGE_NAME, ICON_CLASS, CMD} from '.';
import {FontManager} from './manager';
import {NotebookFontsButton} from './button';
import {FontEditor, FontEditorModel} from './editor';


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

    menu.settingsMenu.addGroup([{type: 'submenu', submenu: manager.menu}]);

    app.commands.addCommand(CMD.editFonts, {
      label: 'Global Fonts...',
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
      app.commands.execute(CMD.editFonts);
    });

    app.docRegistry.addWidgetExtension('Notebook', fontsButton);

    Promise
      .all([settingRegistry.load(PLUGIN_ID), app.restored])
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

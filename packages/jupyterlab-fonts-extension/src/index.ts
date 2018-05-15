import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IMainMenu} from '@jupyterlab/mainmenu';

import {ICommandPalette} from '@jupyterlab/apputils';

import {IFontManager} from '@deathbeds/jupyterlab-fonts';
import {FontManager} from '@deathbeds/jupyterlab-fonts/lib/manager';

import {ISettingRegistry} from '@jupyterlab/coreutils';

const PLUGIN_ID = '@deathbeds/jupyterlab-fonts:fonts';

const plugin: JupyterLabPlugin<IFontManager> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [IMainMenu, ISettingRegistry, ICommandPalette],
  provides: IFontManager,
  activate: function(
    app: JupyterLab,
    menu: IMainMenu,
    settingRegistry: ISettingRegistry,
    palette: ICommandPalette
  ): IFontManager {
    const manager = new FontManager(app.commands, palette);

    manager.menus.forEach((m) =>
      menu.settingsMenu.addGroup([
        {
          type: 'submenu',
          submenu: m,
        },
      ])
    );

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
      .catch((reason: Error) => console.error(reason.message));

    return manager;
  },
};

export default plugin;

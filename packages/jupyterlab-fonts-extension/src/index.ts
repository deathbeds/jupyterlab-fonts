import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IMainMenu} from '@jupyterlab/mainmenu';
import {IFontManager} from '@deathbeds/jupyterlab-fonts';
import {FontManager} from '@deathbeds/jupyterlab-fonts/lib/manager';

import {ISettingRegistry} from '@jupyterlab/coreutils';

const PLUGIN_ID = '@deathbeds/jupyterlab-fonts:fonts';

const plugin: JupyterLabPlugin<IFontManager> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [IMainMenu, ISettingRegistry],
  provides: IFontManager,
  activate: function(
    app: JupyterLab,
    menu: IMainMenu,
    settingRegistry: ISettingRegistry
  ): IFontManager {
    const manager = new FontManager(app.commands);

    manager.menus.forEach((m) =>
      menu.settingsMenu.addGroup([
        {
          type: 'submenu',
          submenu: m,
        },
      ])
    );

    const onSettingsUpdated = (settings: ISettingRegistry.ISettings) => {
      manager.settingsUpdate(settings);
    };

    Promise.all([settingRegistry.load(PLUGIN_ID), app.restored])
      .then(([settings]) => {
        settings.changed.connect(onSettingsUpdated);
        onSettingsUpdated(settings);
        console.log('settings were restored');
      })
      .catch((reason: Error) => {
        console.error(reason.message);
      });
    // Fetch the initial

    return manager;
  },
};

export default plugin;

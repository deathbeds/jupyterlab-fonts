import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IMainMenu} from '@jupyterlab/mainmenu';
import {IFontManager} from '@deathbeds/jupyterlab-fonts';
import {FontManager} from '@deathbeds/jupyterlab-fonts/lib/manager';

const plugin: JupyterLabPlugin<IFontManager> = {
  id: '@deathbeds/jupyterlab-fonts-extension',
  autoStart: true,
  requires: [IMainMenu],
  provides: IFontManager,
  activate: function(app: JupyterLab, menu: IMainMenu): IFontManager {
    const manager = new FontManager(app.commands);

    manager.menus.forEach((m) =>
      menu.settingsMenu.addGroup([
        {
          type: 'submenu',
          submenu: m,
        },
      ])
    );

    setTimeout(function() {
      manager.styles.map((s) => document.body.appendChild(s));
    }, 0);

    return manager;
  },
};

export default plugin;

import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IFontManager} from '@deathbeds/jupyterlab-fonts';
console.log(1);
import '@deathbeds/fatfonts/style/index.css';

const plugin: JupyterLabPlugin<void> = {
  id: '@deathbeds/jupyterlab-font-fatfonts',
  autoStart: true,
  requires: [IFontManager],
  activate: function(app: JupyterLab, fonts: IFontManager) {
    fonts.registerFont('7Segments');
    fonts.registerFont('Miguta');
    fonts.registerFont('Rotunda');
  },
};

export default plugin;

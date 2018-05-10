import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IFontManager} from '@deathbeds/jupyterlab-fonts';

import '../style/index.css';

const plugin: JupyterLabPlugin<void> = {
  id: '@deathbeds/jupyterlab-font-fira-code',
  autoStart: true,
  requires: [IFontManager],
  activate: function(app: JupyterLab, fonts: IFontManager) {
    fonts.registerCodeFont('Fira Code', ['Light', 'Regular', 'Medium', 'Bold']);
  },
};

export default plugin;

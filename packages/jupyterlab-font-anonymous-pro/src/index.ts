import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IFontManager, FontFormat} from '@deathbeds/jupyterlab-fonts';

const weights: {[key: string]: string} = {
  400: 'Regular',
  700: 'Bold',
};

function register(fonts: IFontManager) {
  Object.keys(weights).forEach((weight) => {
    const fontFamily = `Anonymous Pro ${weights[weight]}`;
    fonts.registerFontFace({
      name: fontFamily,
      license: {
        spdx: 'OFL-1.1',
        name: 'SIL Open Font License 1.1',
        text: async () =>
          (await import('!!raw-loader!../vendor/anonymous-pro/LICENSE')) as string,
        holders: [
          `Copyright (c) 2009, Mark Simonson (http://www.ms-studio.com, mark@marksimonson.com), with Reserved Font Name Anonymous Pro Minus.`,
        ],
      },
      faces: async () => {
        const font = (await import(`!!file-loader!typeface-anonymous-pro/files/anonymous-pro-latin-${weight}.woff2`)) as string;
        const uri = await fonts.dataURISrc(font, FontFormat.woff2);
        return [{fontFamily: `'${fontFamily}'`, src: uri}];
      },
    });
  });
}

const plugin: JupyterLabPlugin<void> = {
  id: '@deathbeds/jupyterlab-font-anonymous-pro',
  autoStart: true,
  requires: [IFontManager],
  activate: async function(app: JupyterLab, fonts: IFontManager) {
    fonts.ready.then(() => {
      register(fonts);
    });
  },
};

export default plugin;

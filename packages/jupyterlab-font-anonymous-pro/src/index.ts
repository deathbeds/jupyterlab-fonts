import { JupyterLab, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { IFontManager, FontFormat } from '@deathbeds/jupyterlab-fonts';

const weights: { [key: string]: string } = {
  400: 'Regular',
  700: 'Bold',
};

const facePromises: { [key: string]: () => Promise<string> } = {
  400: async () => {
    return (
      await import(
        `!!file-loader!typeface-anonymous-pro/files/anonymous-pro-latin-400.woff2`
      )
    ).default;
  },
  700: async () => {
    return (
      await import(
        `!!file-loader!typeface-anonymous-pro/files/anonymous-pro-latin-700.woff2`
      )
    ).default;
  },
};

function register(fonts: IFontManager) {
  Object.keys(weights).forEach((weight) => {
    const fontFamily = `Anonymous Pro ${weights[weight]}`;
    fonts.registerFontFace({
      name: fontFamily,
      license: {
        spdx: 'OFL-1.1',
        name: 'SIL Open Font License 1.1',
        text: async () => {
          return (await import('!!raw-loader!../vendor/anonymous-pro/LICENSE')).default;
        },
        holders: [
          `Copyright (c) 2009, Mark Simonson (http://www.ms-studio.com, mark@marksimonson.com), with Reserved Font Name Anonymous Pro Minus.`,
        ],
      },
      faces: async () => {
        const font = await facePromises[weight]();
        const uri = await fonts.dataURISrc(font, FontFormat.woff2);
        return [{ fontFamily: `'${fontFamily}'`, src: uri }];
      },
    });
  });
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: '@deathbeds/jupyterlab-font-anonymous-pro',
  autoStart: true,
  requires: [IFontManager],
  activate: function (_app: JupyterLab, fonts: IFontManager) {
    fonts.ready
      .then(() => {
        register(fonts);
      })
      .catch(console.warn);
  },
};

export default plugin;

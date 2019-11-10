// tslint:disable-next-line
/// <reference path="../../../node_modules/@types/webpack-env/index.d.ts"/>

import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { IFontManager, FontFormat } from '@deathbeds/jupyterlab-fonts';

const weights: { [key: string]: string } = {
  400: 'Regular',
  700: 'Bold'
};

const facePromises: { [key: string]: () => Promise<string> } = {
  400: () =>
    new Promise<string>((resolve, reject) => {
      require.ensure(
        [
          `!!file-loader!typeface-anonymous-pro/files/anonymous-pro-latin-400.woff2`
        ],
        require =>
          resolve(
            require(`!!file-loader!typeface-anonymous-pro/files/anonymous-pro-latin-400.woff2`) as string
          ),
        (error: any) => {
          console.error(error);
          reject();
        },
        'anonymous-pro-400'
      );
    }),
  700: () =>
    new Promise<string>((resolve, reject) => {
      require.ensure(
        [
          `!!file-loader!typeface-anonymous-pro/files/anonymous-pro-latin-700.woff2`
        ],
        require =>
          resolve(
            require(`!!file-loader!typeface-anonymous-pro/files/anonymous-pro-latin-700.woff2`) as string
          ),
        (error: any) => {
          console.error(error);
          reject();
        },
        'anonymous-pro-700'
      );
    })
};

function register(fonts: IFontManager) {
  Object.keys(weights).forEach(weight => {
    const fontFamily = `Anonymous Pro ${weights[weight]}`;
    fonts.registerFontFace({
      name: fontFamily,
      license: {
        spdx: 'OFL-1.1',
        name: 'SIL Open Font License 1.1',
        text: async () =>
          new Promise<string>((resolve, reject) => {
            require.ensure(
              ['!!raw-loader!../vendor/anonymous-pro/LICENSE'],
              require =>
                resolve(
                  require('!!raw-loader!../vendor/anonymous-pro/LICENSE') as string
                ),
              (error: any) => {
                console.error(error);
                reject();
              },
              'anonymous-pro'
            );
          }),
        holders: [
          `Copyright (c) 2009, Mark Simonson (http://www.ms-studio.com, mark@marksimonson.com), with Reserved Font Name Anonymous Pro Minus.`
        ]
      },
      faces: async () => {
        const font = await facePromises[weight]();
        const uri = await fonts.dataURISrc(font, FontFormat.woff2);
        return [{ fontFamily: `'${fontFamily}'`, src: uri }];
      }
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
  }
};

export default plugin;

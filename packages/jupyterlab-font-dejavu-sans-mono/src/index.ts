// tslint:disable-next-line
/// <reference path="../../../node_modules/@types/webpack-env/index.d.ts"/>

import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { IFontManager, FontFormat } from '@deathbeds/jupyterlab-fonts';

const variants = ['', 'Bold'];

const variantPromises: { [key: string]: () => Promise<string> } = {
  '': () =>
    new Promise<string>((resolve, reject) => {
      require.ensure(
        [`!!file-loader!../style/fonts/DejaVuSansMono.woff2`],
        require =>
          resolve(
            require(`!!file-loader!../style/fonts/DejaVuSansMono.woff2`) as string
          ),
        (error: any) => {
          console.error(error);
          reject();
        },
        'dejavu-sans-mono'
      );
    }),
  Bold: () =>
    new Promise<string>((resolve, reject) => {
      require.ensure(
        [`!!file-loader!../style/fonts/DejaVuSansMono-Bold.woff2`],
        require =>
          resolve(
            require(`!!file-loader!../style/fonts/DejaVuSansMono-Bold.woff2`) as string
          ),
        (error: any) => {
          console.error(error);
          reject();
        },
        'dejavu-sans-mono'
      );
    })
};

function register(fonts: IFontManager) {
  variants.forEach(variant => {
    const fontFamily = `DejaVu Sans Mono ${variant}`.trim();
    fonts.registerFontFace({
      name: fontFamily,
      license: {
        spdx: 'OTHER',
        name: 'DejaVu Font License',
        text: async () =>
          new Promise<string>((resolve, reject) => {
            require.ensure(
              ['!!raw-loader!../vendor/dejavu-fonts-ttf/LICENSE'],
              require =>
                resolve(
                  require('!!raw-loader!../vendor/dejavu-fonts-ttf/LICENSE') as string
                ),
              (error: any) => {
                console.error(error);
                reject();
              },
              'dejavu-sans-mono'
            );
          }),
        holders: [
          `Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved.`,
          `Copyright (c) 2006 by Tavmjong Bah.`
        ]
      },
      faces: async () => {
        const font = await variantPromises[variant]();
        const uri = await fonts.dataURISrc(font, FontFormat.woff2);
        return [{ fontFamily: `'${fontFamily}'`, src: uri }];
      }
    });
  });
}

const plugin: JupyterLabPlugin<void> = {
  id: '@deathbeds/jupyterlab-font-dejavu-sans-mono',
  autoStart: true,
  requires: [IFontManager],
  activate: async function(app: JupyterLab, fonts: IFontManager) {
    fonts.ready.then(() => {
      register(fonts);
    });
  }
};

export default plugin;

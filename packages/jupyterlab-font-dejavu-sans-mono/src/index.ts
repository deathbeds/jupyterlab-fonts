import { JupyterLab, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { IFontManager, FontFormat } from '@deathbeds/jupyterlab-fonts';

const variants = ['', 'Bold'];

const variantPromises: { [key: string]: () => Promise<string> } = {
  '': async () => {
    return (await import(`!!file-loader!../style/fonts/DejaVuSansMono.woff2`))
      .default;
  },
  Bold: async () => {
    return (
      await import(`!!file-loader!../style/fonts/DejaVuSansMono-Bold.woff2`)
    ).default;
  }
};

function register(fonts: IFontManager) {
  variants.forEach(variant => {
    const fontFamily = `DejaVu Sans Mono ${variant}`.trim();
    fonts.registerFontFace({
      name: fontFamily,
      license: {
        spdx: 'OTHER',
        name: 'DejaVu Font License',
        text: async () => {
          return (
            await import('!!raw-loader!../vendor/dejavu-fonts-ttf/LICENSE')
          ).default;
        },
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

const plugin: JupyterFrontEndPlugin<void> = {
  id: '@deathbeds/jupyterlab-font-dejavu-sans-mono',
  autoStart: true,
  requires: [IFontManager],
  activate: function(_app: JupyterLab, fonts: IFontManager) {
    fonts.ready
      .then(() => {
        register(fonts);
      })
      .catch(console.warn);
  }
};

export default plugin;

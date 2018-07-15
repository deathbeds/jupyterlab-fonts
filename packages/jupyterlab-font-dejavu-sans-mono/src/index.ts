import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IFontManager, FontFormat} from '@deathbeds/jupyterlab-fonts';

const variants = ['', 'Bold'];

function register(fonts: IFontManager) {
  variants.forEach((variant) => {
    const fontFamily = `DejaVu Sans Mono ${variant}`.trim();
    fonts.registerFontFace({
      name: fontFamily,
      license: {
        spdx: 'OTHER',
        name: 'DejaVu Font License',
        text: async () =>
          (await import('!!raw-loader!../vendor/dejavu-fonts-ttf/LICENSE')) as string,
        holders: [
          `Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved.`,
          `Copyright (c) 2006 by Tavmjong Bah.`,
        ],
      },
      faces: async () => {
        const filename = variant
          ? `DejaVuSansMono-${variant}.woff2`
          : `DejaVuSansMono.woff2`;
        const font = (await import(`!!file-loader!../style/fonts/${filename}`)) as string;
        const uri = await fonts.dataURISrc(font, FontFormat.woff2);
        return [{fontFamily: `'${fontFamily}'`, src: uri}];
      },
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
  },
};

export default plugin;

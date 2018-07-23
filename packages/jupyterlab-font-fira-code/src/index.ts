import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IFontManager, FontFormat} from '@deathbeds/jupyterlab-fonts';

const variants = ['Light', 'Regular', 'Medium', 'Bold'];

function register(fonts: IFontManager) {
  variants.forEach((variant) => {
    fonts.registerFontFace({
      name: `Fira Code ${variant}`,
      license: {
        spdx: 'OFL-1.1',
        name: 'SIL Open Font License 1.1',
        text: async () => (await import('!!raw-loader!firacode/LICENSE')) as string,
        holders: [
          `Copyright (c) 2014, Nikita Prokopov http://tonsky.me with Reserved Font Name Fira Code.`,
          `Copyright (c) 2014, Mozilla Foundation https://mozilla.org/ with Reserved Font Name Fira Sans.`,
          `Copyright (c) 2014, Mozilla Foundation https://mozilla.org/ with Reserved Font Name Fira Mono.`,
          'Copyright (c) 2014, Telefonica S.A.',
        ],
      },
      faces: async () => {
        const font = (await import(`!!file-loader!firacode/distr/woff2/FiraCode-${variant}.woff2`)) as string;
        const uri = await fonts.dataURISrc(font, FontFormat.woff2);
        return [{fontFamily: `'Fira Code ${variant}'`, src: uri}];
      },
    });
  });
}

const plugin: JupyterLabPlugin<void> = {
  id: '@deathbeds/jupyterlab-font-fira-code',
  autoStart: true,
  requires: [IFontManager],
  activate: async function(app: JupyterLab, fonts: IFontManager) {
    fonts.ready.then(() => {
      register(fonts);
    });
  },
};

export default plugin;

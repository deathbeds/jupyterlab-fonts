import { JupyterLab, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { IFontManager, FontFormat } from '@deathbeds/jupyterlab-fonts';

const variants = ['Light', 'Regular', 'Medium', 'Bold'];

const variantPromises: { [key: string]: () => Promise<string> } = {
  Light: async () => {
    return (
      await import(`!!file-loader!firacode/distr/woff2/FiraCode-Light.woff2`)
    ).default;
  },
  Regular: async () => {
    return (
      await import(`!!file-loader!firacode/distr/woff2/FiraCode-Regular.woff2`)
    ).default;
  },
  Medium: async () => {
    return (
      await import(`!!file-loader!firacode/distr/woff2/FiraCode-Medium.woff2`)
    ).default;
  },
  Bold: async () => {
    return (
      await import(`!!file-loader!firacode/distr/woff2/FiraCode-Bold.woff2`)
    ).default;
  }
};

function register(fonts: IFontManager) {
  variants.forEach(variant => {
    fonts.registerFontFace({
      name: `Fira Code ${variant}`,
      license: {
        spdx: 'OFL-1.1',
        name: 'SIL Open Font License 1.1',
        text: async () => {
          return ((await import(
            '!!raw-loader!firacode/LICENSE'
          )) as any) as string;
        },
        holders: [
          `Copyright (c) 2014, Nikita Prokopov http://tonsky.me with Reserved Font Name Fira Code.`,
          `Copyright (c) 2014, Mozilla Foundation https://mozilla.org/ with Reserved Font Name Fira Sans.`,
          `Copyright (c) 2014, Mozilla Foundation https://mozilla.org/ with Reserved Font Name Fira Mono.`,
          'Copyright (c) 2014, Telefonica S.A.'
        ]
      },
      faces: async () => {
        const font = await variantPromises[variant]();
        const uri = await fonts.dataURISrc(font, FontFormat.woff2);
        return [{ fontFamily: `'Fira Code ${variant}'`, src: uri }];
      }
    });
  });
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: '@deathbeds/jupyterlab-font-fira-code',
  autoStart: true,
  requires: [IFontManager],
  activate: async function(_app: JupyterLab, fonts: IFontManager) {
    fonts.ready
      .then(() => {
        register(fonts);
      })
      .catch(console.warn);
  }
};

export default plugin;

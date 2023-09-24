import { makePlugin } from '@deathbeds/jupyterlab-fonts';

const plugin = makePlugin({
  id: '@deathbeds/jupyterlab-font-fira-code',
  fontName: 'Fira Code',
  license: {
    spdx: 'OFL-1.1',
    name: 'SIL Open Font License 1.1',
    holders: [
      `Copyright (c) 2014, Nikita Prokopov http://tonsky.me with Reserved Font Name Fira Code.`,
      `Copyright (c) 2014, Mozilla Foundation https://mozilla.org/ with Reserved Font Name Fira Sans.`,
      `Copyright (c) 2014, Mozilla Foundation https://mozilla.org/ with Reserved Font Name Fira Mono.`,
      'Copyright (c) 2014, Telefonica S.A.',
    ],
  },
  licenseText: async () => {
    return (await import('!!raw-loader!firacode/LICENSE')).default;
  },
  variants: async () => {
    return {
      Light: [
        {
          woff2: () =>
            import(`!!file-loader!firacode/distr/woff2/FiraCode-Light.woff2`),
        },
      ],
      Regular: [
        {
          woff2: () =>
            import(`!!file-loader!firacode/distr/woff2/FiraCode-Regular.woff2`),
        },
      ],
      Medium: [
        {
          woff2: () =>
            import(`!!file-loader!firacode/distr/woff2/FiraCode-Medium.woff2`),
        },
      ],
      Bold: [
        {
          woff2: () => import(`!!file-loader!firacode/distr/woff2/FiraCode-Bold.woff2`),
        },
      ],
    };
  },
});

export default plugin;

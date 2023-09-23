import { makePlugin } from '@deathbeds/jupyterlab-fonts';

const plugin = makePlugin({
  id: '@deathbeds/jupyterlab-font-anonymous-pro',
  fontName: 'Anonymous Pro',
  license: {
    spdx: 'OFL-1.1',
    name: 'SIL Open Font License 1.1',
    holders: [
      `Copyright (c) 2009, Mark Simonson (http://www.ms-studio.com, mark@marksimonson.com), with Reserved Font Name Anonymous Pro Minus.`,
    ],
  },
  licenseText: async () => {
    return (await import('!!raw-loader!../vendor/anonymous-pro/LICENSE')).default;
  },
  variants: async () => {
    return {
      Regular: [
        {
          woff2: () =>
            import(
              `!!file-loader!@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2`
            ),
        },
      ],
      Bold: [
        {
          woff2: () =>
            import(
              `!!file-loader!typeface-anonymous-pro/files/anonymous-pro-latin-700.woff2`
            ),
        },
      ],
    };
  },
});

export default plugin;

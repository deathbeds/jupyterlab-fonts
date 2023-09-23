import { makePlugin } from '@deathbeds/jupyterlab-fonts';

const regular = { fontStyle: 'normal', fontDisplay: 'swap', fontWeight: 400 };
const italic = { fontStyle: 'italic' };
const bold = { fontWeight: 700 };

const plugin = makePlugin({
  id: '@deathbeds/jupyterlab-font-atkinson-hyperlegible',
  fontName: 'Atkinson Hyperlegible',
  license: {
    spdx: 'OFL-1.1',
    name: 'SIL Open Font License 1.1',
    holders: [`Copyright 2020 Braille Institute of America, Inc.`],
  },
  licenseText: async () => {
    return (await import('!!raw-loader!@fontsource/atkinson-hyperlegible/LICENSE'))
      .default;
  },
  variants: async () => {
    return {
      Regular: [
        {
          woff2: () =>
            import(
              `!!file-loader!@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2`
            ),
          style: { ...regular },
        },
        {
          woff2: () =>
            import(
              `!!file-loader!@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-ext-400-normal.woff2`
            ),
          style: { ...regular },
        },
        {
          woff2: () =>
            import(
              `!!file-loader!@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-italic.woff2`
            ),
          style: { ...regular, ...italic },
        },
        {
          woff2: () =>
            import(
              `!!file-loader!@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-ext-400-italic.woff2`
            ),
          style: { ...regular, ...italic },
        },
      ],
      Bold: [
        {
          woff2: () =>
            import(
              `!!file-loader!@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2`
            ),
          style: { ...regular, ...bold },
        },
        {
          woff2: () =>
            import(
              `!!file-loader!@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-italic.woff2`
            ),
          style: { ...regular, ...bold, ...italic },
        },
        {
          woff2: () =>
            import(
              `!!file-loader!@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-ext-700-normal.woff2`
            ),
          style: { ...regular, ...bold },
        },
        {
          woff2: () =>
            import(
              `!!file-loader!@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-ext-700-italic.woff2`
            ),
          style: { ...regular, ...bold, ...italic },
        },
      ],
    };
  },
});

export default plugin;

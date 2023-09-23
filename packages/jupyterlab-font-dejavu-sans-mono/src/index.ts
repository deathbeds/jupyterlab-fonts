import { makePlugin } from '@deathbeds/jupyterlab-fonts';

const plugin = makePlugin({
  id: '@deathbeds/jupyterlab-font-dejavu-sans-mono',
  fontName: `DejaVu Sans Mono`,
  license: {
    spdx: 'OTHER',
    name: 'DejaVu Font License',
    holders: [
      `Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved.`,
      `Copyright (c) 2006 by Tavmjong Bah.`,
    ],
  },
  licenseText: async () => {
    return (await import('!!raw-loader!../vendor/dejavu-fonts-ttf/LICENSE')).default;
  },
  variants: async () => {
    return {
      '': [
        {
          woff2: () => import(`!!file-loader!../style/fonts/DejaVuSansMono.woff2`),
        },
      ],
      Bold: [
        {
          woff2: () => import(`!!file-loader!../style/fonts/DejaVuSansMono-Bold.woff2`),
        },
      ],
    };
  },
});

export default plugin;

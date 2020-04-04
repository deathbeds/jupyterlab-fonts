import { LabIcon } from '@jupyterlab/ui-components';

import fonts from '!!raw-loader!../style/icons/fonts.svg';
import license from '!!raw-loader!../style/icons/copyright.svg';

export const ICONS = {
  fonts: new LabIcon({
    name: 'fonts:fonts',
    svgstr: fonts
  }),
  license: new LabIcon({
    name: 'fonts:license',
    svgstr: license
  })
};

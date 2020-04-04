import { LabIcon } from '@jupyterlab/ui-components';

import fonts from '../style/icons/fonts.svg';
import license from '../style/icons/license.svg';
import deleteForever from '../style/icons/delete-forever.svg';
import deleteOutline from '../style/icons/delete-outline.svg';

export const ICONS = {
  fonts: new LabIcon({
    name: 'fonts:fonts',
    svgstr: fonts
  }),
  license: new LabIcon({
    name: 'fonts:license',
    svgstr: license
  }),
  deleteForever: new LabIcon({
    name: 'fonts:deleteForever',
    svgstr: deleteForever
  }),
  deleteOutline: new LabIcon({
    name: 'fonts:deleteOutline',
    svgstr: deleteOutline
  })
};

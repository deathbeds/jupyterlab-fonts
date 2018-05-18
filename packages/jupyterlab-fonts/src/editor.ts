import {NotebookPanel} from '@jupyterlab/notebook';

import * as React from 'react';

import {VDomModel, VDomRenderer} from '@jupyterlab/apputils';

import {PACKAGE_NAME} from '.';

import {FontManager, ROOT, CODE_FONT_FAMILY, CODE_LINE_HEIGHT, CODE_FONT_SIZE} from './manager';

import '../style/editor.css';

const h = React.createElement;

const EDITOR_CLASS = 'jp-FontsEditor';

export class FontEditorModel extends VDomModel {
  private _notebook: NotebookPanel;
  private _fonts: FontManager;

  get fonts() {
    return this._fonts;
  }

  set fonts(fonts) {
    this._fonts = fonts;
    fonts.settings.changed.connect(() => () => this.stateChanged.emit(void 0));
    this.stateChanged.emit(void 0);
  }

  get notebook() {
    return this._notebook;
  }

  set notebook(notebook) {
    this._notebook = notebook;
    const update = () => this.stateChanged.emit(void 0);
    notebook.model.metadata.changed.connect(update);
    notebook.context.pathChanged.connect(update);
    this.stateChanged.emit(void 0);
  }

  get codeFontFamily() {
    let cff: string;
    if (this.notebook) {
      try {
        cff = (this.notebook.model.metadata.get(PACKAGE_NAME) as any).styles[ROOT][
          CODE_FONT_FAMILY
        ];
      } catch (e) {
        return null;
      }
    } else {
      cff = this.fonts.codeFontFamily;
    }

    return (cff || '').replace(/^"([^"]+)".*/, '$1');
  }

  set codeFontFamily(fontFamily: string) {
    const nb = this.notebook;
    if (nb) {
      const md = JSON.parse(JSON.stringify(nb.model.metadata.get(PACKAGE_NAME) || {}));
      const styles = (md as any).styles || ((md as any).styles = {});
      const root = styles[ROOT] || (styles[ROOT] = {});
      root[CODE_FONT_FAMILY] = `"${fontFamily}", monospace`;
      nb.model.metadata.set(PACKAGE_NAME, md);
    } else {
      this._fonts.codeFontFamily = fontFamily;
    }
  }

  get codeLineHeight() {
    let clh: string;
    if (this.notebook) {
      try {
        clh = (this.notebook.model.metadata.get(PACKAGE_NAME) as any).styles[ROOT][
          CODE_LINE_HEIGHT
        ];
      } catch (e) {
        return null;
      }
    } else {
      clh = this.fonts.codeLineHeight;
    }

    return (clh || '').replace(/^"([^"]+)".*/, '$1');
  }

  set codeLineHeight(lineHeight: string) {
    const nb = this.notebook;
    if (nb) {
      const md = JSON.parse(JSON.stringify(nb.model.metadata.get(PACKAGE_NAME) || {}));
      const styles = (md as any).styles || ((md as any).styles = {});
      const root = styles[ROOT] || (styles[ROOT] = {});
      root[CODE_LINE_HEIGHT] = lineHeight;
      nb.model.metadata.set(PACKAGE_NAME, md);
    } else {
      this._fonts.codeLineHeight = lineHeight;
    }
  }

  get codeFontSize() {
    let cfs: string;
    if (this.notebook) {
      try {
        cfs = (this.notebook.model.metadata.get(PACKAGE_NAME) as any).styles[ROOT][
          CODE_FONT_SIZE
        ];
      } catch (e) {
        return null;
      }
    } else {
      cfs = this.fonts.codeFontSize;
    }

    return (cfs || '').replace(/^"([^"]+)".*/, '$1');
  }

  set codeFontSize(fontSize: string) {
    const nb = this.notebook;
    if (nb) {
      const md = JSON.parse(JSON.stringify(nb.model.metadata.get(PACKAGE_NAME) || {}));
      const styles = (md as any).styles || ((md as any).styles = {});
      const root = styles[ROOT] || (styles[ROOT] = {});
      root[CODE_FONT_SIZE] = fontSize;
      nb.model.metadata.set(PACKAGE_NAME, md);
    } else {
      this._fonts.codeFontSize = fontSize;
    }
  }
}

export class FontEditor extends VDomRenderer<FontEditorModel> {
  constructor() {
    super();
    this.addClass(EDITOR_CLASS);
  }
  protected render(): React.ReactElement<any> {
    const m = this.model;
    if (!m) {
      return h('div');
    }
    const title = m.notebook
      ? m.notebook.context.contentsModel.name.replace(/.ipynb$/, '')
      : 'Global';

    this.title.label = title;

    const fonts = [null, ...Array.from(m.fonts.fonts.keys())];

    const onCodeFontFamily = (evt: React.FormEvent<HTMLSelectElement>) => {
      const val = (evt.target as HTMLSelectElement).value;
      m.codeFontFamily = val;
    };

    const onCodeFontSize = (evt: React.FormEvent<HTMLSelectElement>) => {
      const val = (evt.target as HTMLSelectElement).value;
      m.codeFontSize = val;
    };

    const onCodeLineHeight = (evt: React.FormEvent<HTMLSelectElement>) => {
      const val = (evt.target as HTMLSelectElement).value;
      m.codeLineHeight = val;
    };

    const codeFontFamily = m.codeFontFamily;
    const codeLineHeight = m.codeLineHeight;
    const codeFontSize = m.codeFontSize;

    return h('div', null, [
      h('h1', {key: 1}, [
        ...(m.notebook ? [h('div', {
          className: 'jp-NotebookIcon',
          style: {
            width: 'var(--jp-ui-font-size2)',
            height: 'var(--jp-ui-font-size2)',
            display: 'inline-block',
            verticalAlign: 'middle'
          }
        })] : []),
        `${title} Fonts`
      ]),
      h('h2', {key: 2}, 'Code'),
      h(
        'select',
        {className: 'jp-mod-styled', onChange: onCodeFontFamily, key: 3},
        fonts.map((label, key) => {
          return h(
            'optgroup',
            {label, key},
            (m.fonts.fonts.get(label) || [null]).map((face, key) => {
              const selected = codeFontFamily === face ? {selected: true} : {};
              return h('option', {key, ...selected}, face || '- default -');
            })
          );
        })
      ),
      h('h3', {key: 5}, 'Font Size'),
      h(
        'select',
        {className: 'jp-mod-styled', onChange: onCodeFontSize},
        (m.fonts.fontSizeOptions()).map((fontSize, key) => {
          const selected = codeFontSize === fontSize ? {selected: true} : {};
          return h('option', {key, ...selected}, fontSize || '- default -');
        })
      ),
      h('h3', {key: 6}, 'Line Height'),
      h(
        'select',
        {className: 'jp-mod-styled', onChange: onCodeLineHeight, key: 7},
        (m.fonts.lineHeightOptions()).map((lineHeight, key) => {
          const selected = codeLineHeight === lineHeight ? {selected: true} : {};
          return h('option', {key, ...selected}, lineHeight || '- default -');
        })
      ),
    ]);
  }
}

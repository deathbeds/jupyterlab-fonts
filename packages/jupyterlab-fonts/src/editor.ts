import {NotebookPanel} from '@jupyterlab/notebook';

import * as React from 'react';

import {VDomModel, VDomRenderer} from '@jupyterlab/apputils';

import {PACKAGE_NAME} from '.';

import {FontManager, ROOT, CODE_FONT_FAMILY} from './manager';

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

    return cff.replace(/^"([^"]+)".*/, '$1');
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

    const fonts = Array.from(m.fonts.fonts.keys());

    const onChange = (evt: React.FormEvent<HTMLSelectElement>) => {
      const val = (evt.target as HTMLSelectElement).value;
      m.codeFontFamily = val;
    };

    const codeFontFamily = m.codeFontFamily;

    return h('div', null, [
      h('h1', {key: 1}, `${title} Fonts`),
      h('h2', {key: 2}, 'Code'),
      h(
        'select',
        {className: 'jp-mod-styled', onChange},
        fonts.map((label, key) => {
          return h(
            'optgroup',
            {label, key},
            m.fonts.fonts.get(label).map((face, key) => {
              const selected = codeFontFamily === face ? {selected: true} : {};
              return h('option', {key, ...selected}, face);
            })
          );
        })
      ),
    ]);
  }
}

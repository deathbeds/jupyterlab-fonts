import {NotebookPanel} from '@jupyterlab/notebook';

import * as React from 'react';

import {VDomModel, VDomRenderer} from '@jupyterlab/apputils';

import {TextKind, TEXT_OPTIONS, TEXT_LABELS, TextProperty} from '.';

import {FontManager} from './manager';

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

    return h('div', null, [
      this.header(),
      h('section', {key: 2, title: 'Code'}, [
        h('h2', {key: 1}, 'Code'),
        this.textSelect('font-family', TextKind.code, {key: 2}),
        this.textSelect('font-size', TextKind.code, {key: 3}),
        this.textSelect('line-height', TextKind.code, {key: 4}),
      ]),
      h('section', {key: 3, title: 'Content'}, [
        h('h2', {key: 1}, 'Content'),
        // TODO re-enable in 0.33
        // this.textSelect('font-family', TextKind.content, {key: 2}),
        this.textSelect('font-size', TextKind.content, {key: 3}),
        this.textSelect('line-height', TextKind.content, {key: 4}),
      ]),
    ]);
  }

  protected textSelect(prop: TextProperty, kind: TextKind, sectionProps: any) {
    const m = this.model;
    const onChange = (evt: React.FormEvent<HTMLSelectElement>) => {
      let value = (evt.target as HTMLSelectElement).value;
      m.fonts.setTextStyle(prop, value, {kind, notebook: m.notebook});
    };

    return h('h3', sectionProps, [
      h('label', {key: 1}, TEXT_LABELS[prop]),
      h(
        'select',
        {
          className: 'jp-mod-styled',
          title: `${TEXT_LABELS[prop]}`,
          onChange,
          defaultValue: m.fonts.getTextStyle(prop, {kind, notebook: m.notebook}),
          key: 2,
        },
        [null, ...TEXT_OPTIONS[prop](m.fonts)].map((value, key) => {
          return h(
            'option',
            {
              key,
              value: prop !== 'font-family' ? value : value ? `'${value}'` : '',
            },
            value || '-'
          );
        })
      ),
    ]);
  }

  protected header() {
    const m = this.model;
    const title = m.notebook
      ? m.notebook.context.contentsModel.name.replace(/.ipynb$/, '')
      : 'Global';

    this.title.label = title;

    return h('h1', {key: 1}, [
      ...(m.notebook ? [h('div', {className: 'jp-NotebookIcon'})] : []),
      `${title} Fonts`,
    ]);
  }
}

import {NotebookPanel} from '@jupyterlab/notebook';

import * as React from 'react';

import {VDomModel, VDomRenderer} from '@jupyterlab/apputils';

import {TextKind, TEXT_OPTIONS, TEXT_LABELS, TextProperty, IFontFaceOptions} from '.';

import {FontManager} from './manager';

import '../style/editor.css';

const h = React.createElement;

const EDITOR_CLASS = 'jp-FontsEditor';
const ENABLED_CLASS = 'jp-FontsEditor-enable';
const FIELD_CLASS = 'jp-FontsEditor-field';
const SECTION_CLASS = 'p-CommandPalette-header';
const DUMMY = '-';

export class FontEditorModel extends VDomModel {
  private _notebook: NotebookPanel;
  private _fonts: FontManager;

  get fonts() {
    return this._fonts;
  }

  set fonts(fonts) {
    if (this._fonts && this._fonts.settings) {
      this._fonts.settings.changed.disconnect(this.onSettingsChange, this);
    }
    this._fonts = fonts;
    fonts.settings.changed.connect(
      this.onSettingsChange,
      this
    );
    this.stateChanged.emit(void 0);
  }

  private onSettingsChange() {
    this.stateChanged.emit(void 0);
  }

  get notebook() {
    return this._notebook;
  }

  set notebook(notebook) {
    this._notebook = notebook;
    notebook.model.metadata.changed.connect(
      this.onSettingsChange,
      this
    );
    notebook.context.pathChanged.connect(
      this.onSettingsChange,
      this
    );
    this.stateChanged.emit(void 0);
  }

  get enabled() {
    return this._fonts.enabled;
  }

  async setEnabled(enabled: boolean) {
    if (this.notebook == null) {
      await this._fonts.settings.set('enabled', enabled);
      this.stateChanged.emit(void 0);
    }
  }

  dispose() {
    if (this._fonts && this._fonts.settings) {
      this._fonts.settings.changed.disconnect(this.onSettingsChange, this);
    }
    super.dispose();
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
      ...this.header(),
      h('section', {key: 2, title: 'Code'}, [
        h('h3', {key: 1, className: SECTION_CLASS}, 'Code'),
        this.textSelect('font-family', TextKind.code, {key: 2}),
        this.textSelect('font-size', TextKind.code, {key: 3}),
        this.textSelect('line-height', TextKind.code, {key: 4}),
      ]),
      h('section', {key: 3, title: 'Content'}, [
        h('h3', {key: 1, className: SECTION_CLASS}, 'Content'),
        // TODO re-enable in 0.33
        // this.textSelect('font-family', TextKind.content, {key: 2}),
        this.textSelect('font-size', TextKind.content, {key: 3}),
        this.textSelect('line-height', TextKind.content, {key: 4}),
      ]),
    ]);
  }

  protected fontFaceExtras(m: FontEditorModel, fontFamily: {}) {
    let font: IFontFaceOptions;
    let unquoted = `${fontFamily}`.slice(1, -1);
    if (m.fonts.fonts.get(unquoted)) {
      font = m.fonts.fonts.get(unquoted);
    }
    return !font
      ? []
      : [
          h(
            'em',
            {title: font.license.holders.join('\n')},
            h('button', {
                className: 'jp-mod-styled jp-Toolbar-item jp-Toolbar-button',
                onClick: () => m.fonts.requestLicensePane(font)
              },
              font.license.spdx
            )
          ),
        ];
  }

  protected textSelect(prop: TextProperty, kind: TextKind, sectionProps: {}) {
    const m = this.model;
    const onChange = (evt: React.FormEvent<HTMLSelectElement>) => {
      let value = (evt.target as HTMLSelectElement).value;
      value = value === DUMMY ? null : value;
      m.fonts.setTextStyle(prop, value, {kind, notebook: m.notebook});
    };
    const value = m.fonts.getTextStyle(prop, {kind, notebook: m.notebook});
    const extra = prop === 'font-family' ? this.fontFaceExtras(m, value) : [];

    return h('div', {className: FIELD_CLASS, ...sectionProps}, [
      h('label', {key: 1}, TEXT_LABELS[prop]),
      h('div', {}, [
        h(
          'select',
          {
            className: 'jp-mod-styled',
            title: `${TEXT_LABELS[prop]}`,
            onChange,
            value: value || DUMMY,
            key: 2,
          },
          [null, ...TEXT_OPTIONS[prop](m.fonts)].map((value, key) => {
            return h(
              'option',
              {
                key,
                value:
                  value == null ? DUMMY : prop === 'font-family' ? `'${value}'` : value,
              },
              value || DUMMY
            );
          })
        ),
        ...extra,
      ]),
    ]);
  }

  protected header() {
    const m = this.model;
    const title = m.notebook
      ? m.notebook.context.contentsModel.name.replace(/.ipynb$/, '')
      : 'Global';

    this.title.label = title;

    const h2 = h('h2', {key: 1}, [
      ...(m.notebook ? [h('div', {className: 'jp-NotebookIcon'})] : []),
      `${title} Fonts`,
    ]);

    if (m.notebook != null) {
      return [h2];
    }

    const onChange = async (evt: Event) => {
      await m.setEnabled(!!(evt.currentTarget as HTMLInputElement).checked);
    };

    return [
      h2,
      h(
        'label',
        {className: ENABLED_CLASS},
        'Enabled',
        h('input', {
          type: 'checkbox',
          checked: m.enabled,
          onChange,
        })
      ),
    ];
  }
}

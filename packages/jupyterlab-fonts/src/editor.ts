import {NotebookPanel} from '@jupyterlab/notebook';

import {Dialog, showDialog} from '@jupyterlab/apputils';

import * as React from 'react';

import {VDomModel, VDomRenderer} from '@jupyterlab/apputils';

import {
  TextKind,
  TEXT_OPTIONS,
  TEXT_LABELS,
  TextProperty,
  IFontFaceOptions,
  PACKAGE_NAME,
} from '.';

import {FontManager} from './manager';

import * as SCHEMA from './schema';

import '../style/editor.css';

const h = React.createElement;

const EDITOR_CLASS = 'jp-FontsEditor';
const ENABLED_CLASS = 'jp-FontsEditor-enable';
const FIELD_CLASS = 'jp-FontsEditor-field';
const EMBED_CLASS = 'jp-FontsEditor-embed';
const SECTION_CLASS = 'p-CommandPalette-header';
const BUTTON_CLASS = 'jp-FontsEditor-button jp-mod-styled';
const SIZE_CLASS = 'jp-FontsEditor-size';
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

  get notebookMetadata() {
    if (this.notebook) {
      return this.notebook.model.metadata.get(PACKAGE_NAME) as SCHEMA.ISettings;
    }
  }

  clearNotebookMetadata(fontName?: string) {
    let meta = this.notebookMetadata;
    delete meta.fonts[fontName];
    delete meta.fontLicenses[fontName];
    this.notebook.model.metadata.set(PACKAGE_NAME, JSON.parse(
      JSON.stringify(meta)
    ) as any);
    this.stateChanged.emit(void 0);
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
    return !font ? [] : [this.licenseButton(m, font)];
  }

  protected licenseButton(m: FontEditorModel, font: IFontFaceOptions) {
    return h(
      'button',
      {
        className: BUTTON_CLASS,
        onClick: () => m.fonts.requestLicensePane(font),
      },
      font.license.spdx
    );
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
        ...extra,
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
      ]),
    ]);
  }

  protected deleteButton(m: FontEditorModel, fontName: string) {
    return h(
      'button',
      {
        className: `${BUTTON_CLASS} jp-FontsEditor-delete-icon`,
        title: `Delete Embedded Font`,
        onClick: async () => {
          const result = await showDialog({
            title: `Delete Font from Notebook`,
            body: `If you did not embed ${fontName}, you might not be able to get it back.`,
            buttons: [Dialog.cancelButton(), Dialog.warnButton({label: 'DELETE'})],
          });

          if (result.button.accept) {
            m.clearNotebookMetadata(fontName);
          }
        },
      },
      'x'
    );
  }

  protected embeddedFont(m: FontEditorModel, fontName: string) {
    const faces = m.notebookMetadata.fonts[fontName];
    const license = m.notebookMetadata.fontLicenses[fontName];
    const size = faces.reduce(
      (memo, face) => memo + `${face.src}`.length,
      license.text.length
    );
    const kb = parseInt(`${size / 1024}`, 10);

    return h('li', {key: fontName}, [
      h('label', null, fontName),
      this.licenseButton(m, {
        name: fontName,
        license: {
          name: license.name,
          spdx: license.spdx,
          text: async () => license.text,
          holders: license.holders,
        },
        faces: async () => faces,
      }),
      h('span', {className: SIZE_CLASS}, `${kb} kb`),
      this.deleteButton(m, fontName),
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
      return [
        h2,
        h('h3', {className: 'p-CommandPalette-header'}, 'Embedded fonts'),
        h(
          'ul',
          {className: EMBED_CLASS},
          Object.keys((m.notebookMetadata || {}).fonts || {}).map((fontName) => {
            return this.embeddedFont(m, fontName);
          })
        ),
      ];
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

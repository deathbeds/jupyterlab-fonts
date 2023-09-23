import { Dialog, showDialog, VDomModel, VDomRenderer } from '@jupyterlab/apputils';
import { NotebookPanel } from '@jupyterlab/notebook';
import { ReadonlyJSONObject } from '@lumino/coreutils';
import * as React from 'react';

import * as compat from './labcompat';
import { FontManager } from './manager';
import * as SCHEMA from './schema';
import {
  TextKind,
  TEXT_OPTIONS,
  TEXT_LABELS,
  KIND_LABELS,
  TextProperty,
  IFontFaceOptions,
  PACKAGE_NAME,
} from './tokens';

import '../style/editor.css';

const h = React.createElement;

const EDITOR_CLASS = 'jp-FontsEditor';
const ENABLED_CLASS = 'jp-FontsEditor-enable';
const FIELD_CLASS = 'jp-FontsEditor-field';
const EMBED_CLASS = 'jp-FontsEditor-embed';
const SECTION_CLASS = 'lm-CommandPalette-header';
const BUTTON_CLASS = 'jp-FontsEditor-button jp-mod-styled';
const SIZE_CLASS = 'jp-FontsEditor-size';
const DUMMY = '-';

export class FontEditorModel extends VDomModel {
  private _notebook: NotebookPanel | null;
  private _fonts: FontManager;

  get fonts() {
    return this._fonts;
  }

  set fonts(fonts) {
    if (this._fonts && this._fonts.settings) {
      this._fonts.settings.changed.disconnect(this.onSettingsChange, this);
    }
    this._fonts = fonts;
    fonts.settings.changed.connect(this.onSettingsChange, this);
    this.stateChanged.emit(void 0);
  }

  private onSettingsChange() {
    this.stateChanged.emit(void 0);
  }

  get notebook() {
    return this._notebook;
  }

  set notebook(notebook) {
    if (this._notebook?.model) {
      compat
        .metadataSignal(this._notebook.model)
        .disconnect(this.onSettingsChange, this);
      this._notebook.context.pathChanged.disconnect(this.onSettingsChange, this);
    }
    this._notebook = notebook;
    if (this._notebook?.model) {
      compat.metadataSignal(this._notebook.model).connect(this.onSettingsChange, this);
      this._notebook.context.pathChanged.connect(this.onSettingsChange, this);
    }
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
    if (this.notebook?.model) {
      return compat.getPanelMetadata(
        this.notebook.model,
        PACKAGE_NAME,
      ) as SCHEMA.ISettings;
    }
  }

  clearNotebookMetadata(fontName?: string) {
    let meta = this.notebookMetadata;
    if (fontName) {
      if (meta?.fonts) {
        delete meta.fonts[fontName];
      }
      if (meta?.fontLicenses) {
        delete meta.fontLicenses[fontName];
      }
    }
    if (this.notebook?.model) {
      compat.setPanelMetadata(
        this.notebook.model,
        PACKAGE_NAME,
        JSON.parse(JSON.stringify(meta)) as any,
      );
    }
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
    super(new FontEditorModel());
    this.addClass(EDITOR_CLASS);
  }

  protected render(): React.ReactElement<any> {
    const m = this.model;
    if (!m) {
      return h('div', { key: 'empty' });
    }

    return h('div', { key: 'editor' }, [
      ...this.header(),
      ...[TextKind.code, TextKind.content].map((kind) =>
        h('section', { key: `${kind}-section`, title: KIND_LABELS[kind] }, [
          h(
            'h3',
            { key: `${kind}-header`, className: SECTION_CLASS },
            KIND_LABELS[kind],
          ),
          ...['font-family', 'font-size', 'line-height'].map((prop: TextProperty) =>
            this.textSelect(prop, kind, { key: `${kind}-${prop}` }),
          ),
        ]),
      ),
      ...[TextKind.ui].map((kind) =>
        h('section', { key: `${kind}-section`, title: KIND_LABELS[kind] }, [
          h(
            'h3',
            { key: `${kind}-header`, className: SECTION_CLASS },
            KIND_LABELS[kind],
          ),
          ...['font-family'].map((prop: TextProperty) =>
            this.textSelect(prop, kind, { key: `${kind}-${prop}` }),
          ),
        ]),
      ),
    ]);
  }

  protected fontFaceExtras(m: FontEditorModel, fontFamily: string) {
    let font: IFontFaceOptions | undefined;
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
        title: font.license.name,
        key: font.name,
        onClick: () => m.fonts.requestLicensePane(font),
      },
      font.license.spdx,
    );
  }

  protected textSelect(
    prop: TextProperty,
    kind: TextKind,
    sectionProps: ReadonlyJSONObject,
  ) {
    const m = this.model;
    const onChange = (evt: React.FormEvent<HTMLSelectElement>) => {
      let value: string | null = (evt.target as HTMLSelectElement).value;
      value = value === DUMMY ? null : value;
      m.fonts
        .setTextStyle(prop, value, {
          kind,
          ...(m.notebook ? { notebook: m.notebook } : {}),
        })
        .catch(console.warn);
    };
    const value = m.fonts.getTextStyle(prop, {
      kind,
      notebook: m.notebook || void 0,
    });
    const extra = prop === 'font-family' ? this.fontFaceExtras(m, value as any) : [];

    return h('div', { className: FIELD_CLASS, key: 'select-field', ...sectionProps }, [
      h('label', { key: 'select-label' }, TEXT_LABELS[prop]),
      h('div', { key: 'select-wrap' }, [
        ...extra,
        h(
          'select',
          {
            className: 'jp-mod-styled',
            title: `${TEXT_LABELS[prop]}`,
            onChange,
            defaultValue: value || DUMMY,
            key: `select`,
          },
          [null, ...TEXT_OPTIONS[prop](m.fonts)].map((value) => {
            return h(
              'option',
              {
                key: `'${value}'`,
                value:
                  value == null ? DUMMY : prop === 'font-family' ? `'${value}'` : value,
              },
              `${value || DUMMY}`,
            );
          }),
        ),
      ]),
    ]);
  }

  protected deleteButton(m: FontEditorModel, fontName: string) {
    return h(
      'button',
      {
        className: BUTTON_CLASS,
        title: `Delete Embedded Font`,
        key: 'delete',
        onClick: async () => {
          const result = await showDialog({
            title: `Delete Embedded Font from Notebook`,
            body: `If you dont have ${fontName} installed, you might not be able to re-embed it`,
            buttons: [Dialog.cancelButton(), Dialog.warnButton({ label: 'DELETE' })],
          });

          if (result.button.accept) {
            m.clearNotebookMetadata(fontName);
          }
        },
      },
      'Delete',
    );
  }

  protected enabler(m: FontEditorModel) {
    const onChange = async (evt: Event) => {
      await m.setEnabled(!!(evt.currentTarget as HTMLInputElement).checked);
    };

    return h(
      'label',
      { key: 'enable-label' },
      h('span', { key: 'enable-text' }, 'Enabled'),
      h('input', {
        key: 'enable-input',
        type: 'checkbox',
        checked: m.enabled,
        onChange,
      }),
    );
  }

  protected embeddedFont(m: FontEditorModel, fontName: string) {
    if (m.notebookMetadata?.fonts == null || m.notebookMetadata.fontLicenses == null) {
      return null;
    }
    const faces = m.notebookMetadata.fonts[fontName];
    const license = m.notebookMetadata.fontLicenses[fontName];
    const size = (faces || []).reduce(
      (memo, face) => memo + `${face.src}`.length,
      license.text.length,
    );
    const kb = parseInt(`${size / 1024}`, 10);

    return h('li', { key: fontName }, [
      h('label', { key: 'label' }, fontName),
      this.licenseButton(m, {
        name: fontName,
        license: {
          name: license.name,
          spdx: license.spdx,
          text: async () => license.text,
          holders: license.holders,
        },
        faces: async () => faces || [],
      }),
      h('span', { className: SIZE_CLASS, key: 'font-kb' }, `${kb} kb`),
      this.deleteButton(m, fontName),
    ]);
  }

  protected header() {
    const m = this.model;
    const title = m.notebook
      ? m.notebook.context.contentsModel?.name.replace(/.ipynb$/, '')
      : 'Global';

    this.title.label = title || 'Unknown';

    const h2 = h('h2', { key: 'scope-head' }, [
      h('label', { key: 'scope-label' }, `Fonts » ${title}`),
      ...(m.notebook
        ? [h('div', { className: 'jp-NotebookIcon', key: 'scope-icon' })]
        : []),
    ]);

    if (m.notebook != null) {
      return [
        h2,
        h('section', { key: 'embed-section' }, [
          h('h3', { className: SECTION_CLASS, key: 'embed-head' }, 'Embedded fonts'),
          h(
            'ul',
            { className: EMBED_CLASS, key: 'embeds' },
            Object.keys((m.notebookMetadata || {}).fonts || {}).map((fontName) => {
              return this.embeddedFont(m, fontName);
            }),
          ),
        ]),
      ];
    } else {
      return [
        h2,
        h('section', { key: 'enable-section', className: ENABLED_CLASS }, [
          h(
            'h3',
            { className: SECTION_CLASS, key: 'enable-header' },
            'Enable/Disable All Fonts',
          ),
          this.enabler(m),
        ]),
      ];
    }
  }
}

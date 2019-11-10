import * as JSS from 'jss';
import jssPresetDefault from 'jss-preset-default';
import { Signal } from '@phosphor/signaling';

import { NotebookPanel } from '@jupyterlab/notebook';

import { ROOT, IFontFaceOptions } from '.';

import * as SCHEMA from './schema';

export class Stylist {
  fonts = new Map<string, IFontFaceOptions>();

  private _globalStyles: HTMLStyleElement;
  private _notebookStyles = new Map<NotebookPanel, HTMLStyleElement>();
  private _jss = JSS.create(jssPresetDefault());
  private _fontCache = new Map<string, SCHEMA.IFontFacePrimitive[]>();
  private _cacheUpdated = new Signal<this, void>(this);

  constructor() {
    this._globalStyles = document.createElement('style');
  }
  get cacheUpdated() {
    return this._cacheUpdated;
  }

  registerNotebook(notebook: NotebookPanel, register: boolean) {
    if (register) {
      this._notebookStyles.set(notebook, document.createElement('style'));
      notebook.disposed.connect(this._onDisposed, this);
      this.hack();
    } else {
      this._onDisposed(notebook);
    }
  }

  private _onDisposed(notebook: NotebookPanel) {
    if (this._notebookStyles.has(notebook)) {
      this._notebookStyles.get(notebook).remove();
      this._notebookStyles.delete(notebook);
      notebook.disposed.disconnect(this._onDisposed, this);
    }
  }

  get stylesheets() {
    return [this._globalStyles, ...Array.from(this._notebookStyles.values())];
  }

  notebooks() {
    return Array.from(this._notebookStyles.keys());
  }

  stylesheet(
    meta: SCHEMA.ISettings,
    notebook: NotebookPanel = null,
    clear = false
  ) {
    let sheet = notebook
      ? this._notebookStyles.get(notebook)
      : this._globalStyles;

    let style = notebook
      ? this._nbMetaToStyle(meta, notebook)
      : this._settingsToStyle(meta);

    let jss = this._jss.createStyleSheet(style as any);
    let css = jss.toString();

    if (sheet.textContent !== css) {
      sheet.textContent = css;
    }
    this.hack();
  }

  private _nbMetaToStyle(
    meta: SCHEMA.ISettings,
    notebook: NotebookPanel
  ): SCHEMA.IStyles {
    const id = notebook.id;
    let jss: any = { '@font-face': [], '@global': {} };
    let idStyles: any = (jss['@global'][`.jp-NotebookPanel[id='${id}']`] = {});

    if (meta.fonts) {
      for (let fontFamily in meta.fonts) {
        jss['@font-face'] = jss['@font-face'].concat(meta.fonts[fontFamily]);
      }
    }

    let styles = meta.styles || {};
    for (let k in styles) {
      if (k === ROOT) {
        for (let rootK in styles[k]) {
          idStyles[rootK] = styles[k][rootK];
        }
      } else if (typeof styles[k] === 'object') {
        idStyles[`& ${k}`] = styles[k];
      } else {
        idStyles[k] = styles[k];
      }
    }
    return jss as SCHEMA.IStyles;
  }

  private _settingsToStyle(meta: SCHEMA.ISettings): SCHEMA.IStyles {
    let raw = JSON.stringify(meta.styles);
    let styles = JSON.parse(raw) as SCHEMA.ISettings;
    let faces = {} as SCHEMA.IFontFaceObject;
    for (let font of Array.from(this.fonts.keys())) {
      if (raw.indexOf(`'${font}'`) > -1 && !faces[font]) {
        if (this._fontCache.has(font)) {
          faces[font] = this._fontCache.get(font);
        } else {
          // tslint:disable-next-line
          new Promise((resolve, reject) => {
            this.fonts
              .get(font)
              .faces()
              .then(
                faces => {
                  if (this._fontCache.has(font)) {
                    return;
                  }
                  this._fontCache.set(font, faces);
                  this._cacheUpdated.emit(void 0);
                  resolve();
                },
                function(err) {
                  console.error('rejected!', err);
                  reject();
                }
              );
          });
        }
      }
    }

    let flatFaces = Object.keys(faces).reduce((m, face) => {
      return m.concat(faces[face]);
    }, [] as SCHEMA.IFontFacePrimitive[]);

    return {
      '@global': styles as any,
      '@font-face': flatFaces as any
    } as SCHEMA.IStyles;
  }

  dispose() {
    this._globalStyles.remove();
    for (let notebook of Array.from(this._notebookStyles.keys())) {
      this._onDisposed(notebook);
    }
  }

  hack(show = true) {
    if (show) {
      setTimeout(
        () =>
          this.stylesheets.map(s => {
            document.body.appendChild(s);
          }),
        0
      );
    } else {
      this.stylesheets.map(el => el.remove());
    }
  }
}

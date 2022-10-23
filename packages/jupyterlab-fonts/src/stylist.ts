import { NotebookPanel } from '@jupyterlab/notebook';
import { Signal } from '@lumino/signaling';
import * as JSS from 'jss';
import jssPresetDefault from 'jss-preset-default';

import * as SCHEMA from './schema';

import { ROOT, IFontFaceOptions, DOM } from '.';

export class Stylist {
  fonts = new Map<string, IFontFaceOptions>();

  private _globalStyles: HTMLStyleElement;
  private _notebookStyles = new Map<NotebookPanel, HTMLStyleElement>();
  private _jss = JSS.create(jssPresetDefault());
  private _fontCache = new Map<string, SCHEMA.IFontFacePrimitive[]>();
  private _cacheUpdated = new Signal<this, void>(this);

  constructor() {
    this._globalStyles = document.createElement('style');
    this._globalStyles.classList.add(DOM.sheet);
    this._globalStyles.classList.add(DOM.modGlobal);
  }
  get cacheUpdated() {
    return this._cacheUpdated;
  }

  registerNotebook(notebook: NotebookPanel, register: boolean) {
    if (register) {
      const sheet = document.createElement('style');
      this._notebookStyles.set(notebook, sheet);
      sheet.classList.add(DOM.sheet);
      sheet.classList.add(DOM.modNotebook);
      notebook.content.modelContentChanged.connect(
        this._onNotebookModelContentChanged,
        this
      );
      notebook.disposed.connect(this._onDisposed, this);
      this.hack();
    } else {
      this._onDisposed(notebook);
    }
  }

  private _onNotebookModelContentChanged(arg: any, arg1: any) {
    console.warn('_onNotebookModelContentChanged', arg, arg1);
  }

  private _onDisposed(notebook: NotebookPanel) {
    if (this._notebookStyles.has(notebook)) {
      this._notebookStyles.get(notebook)?.remove();
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

  stylesheet(meta: SCHEMA.ISettings, notebook?: NotebookPanel, clear = false) {
    let sheet = notebook ? this._notebookStyles.get(notebook) : this._globalStyles;

    let style = notebook
      ? this._nbMetaToStyle(meta, notebook)
      : this._settingsToStyle(meta);

    let jss = this._jss.createStyleSheet(style as any);
    let css = jss.toString();

    if (sheet && sheet.textContent !== css) {
      sheet.textContent = css;
    }

    this.hack();
  }

  private _nbMetaToStyle(
    meta: SCHEMA.ISettings,
    notebook: NotebookPanel
  ): SCHEMA.IStyles {
    const id = notebook.id;
    let jss: any = { '@font-face': [], '@global': {}, '@import': [] };
    let idStyles: any = (jss['@global'][`.jp-NotebookPanel[id='${id}']`] = {});

    if (meta.fonts) {
      for (let fontFamily in meta.fonts) {
        jss['@font-face'] = jss['@font-face'].concat(meta.fonts[fontFamily]);
      }
    }

    let styles = meta.styles || {};
    for (let kv of Object.entries(styles)) {
      let [k, v] = kv;
      switch (k) {
        case '@import':
        case '@font-face':
          jss[k].push(...(Array.isArray(v) ? v : [v]));
          break;
        default:
          if (k === ROOT) {
            for (let rootK in v as any[]) {
              if (styles == null || v == null) {
                continue;
              }
              idStyles[rootK] = (v as any)[rootK];
            }
          } else if (typeof v === 'object') {
            idStyles[`& ${k}`] = v;
          } else {
            idStyles[k] = v;
          }
          break;
      }
    }
    return jss as SCHEMA.IStyles;
  }

  private _settingsToStyle(meta: SCHEMA.ISettings): SCHEMA.IStyles {
    let raw = JSON.stringify(meta.styles);
    let styles = JSON.parse(raw) as SCHEMA.ISettings;
    let faces = {} as SCHEMA.IFontFaceObject;
    let imports: string[] = [];
    for (let font of Array.from(this.fonts.keys())) {
      if (raw.indexOf(`'${font}'`) > -1 && !faces[font]) {
        const cachedFont = this._fontCache.get(font);
        if (cachedFont != null) {
          faces[font] = cachedFont;
        } else {
          new Promise<void>((resolve, reject) => {
            const options = this.fonts.get(font);
            if (options == null) {
              reject();
              return;
            } else {
              options
                .faces()
                .then((faces) => {
                  if (this._fontCache.has(font)) {
                    return;
                  }
                  this._fontCache.set(font, faces);
                  this._cacheUpdated.emit(void 0);
                  resolve(void 0);
                })
                .catch(reject);
            }
          }).catch(console.warn);
        }
      }
    }

    let flatFaces = Object.keys(faces).reduce((m, face) => {
      const foundFaces = faces[face];
      if (faces && foundFaces != null) {
        return m.concat(foundFaces);
      }
    }, [] as SCHEMA.IFontFacePrimitive[]);

    let styleFaces: any[] = [];

    let globalStyles: SCHEMA.ISettings = {};

    for (let kv of Object.entries(styles)) {
      let [k, v] = kv;
      switch (k) {
        case '@import':
          imports.push(...(Array.isArray(v) ? v : [v]));
          break;
        case '@font-face':
          styleFaces.push(...(Array.isArray(v) ? v : [v]));
          break;
        default:
          globalStyles[k] = v;
          break;
      }
    }

    return {
      '@global': globalStyles as any,
      '@font-face': [flatFaces as any, ...styleFaces],
      '@import': imports as any,
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
          this.stylesheets.map((s) => {
            document.body.appendChild(s);
          }),
        0
      );
    } else {
      this.stylesheets.map((el) => el.remove());
    }
  }
}

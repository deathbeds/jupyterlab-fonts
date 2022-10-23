import { Notebook, NotebookPanel } from '@jupyterlab/notebook';
import { Signal } from '@lumino/signaling';
import * as JSS from 'jss';
import jssPresetDefault from 'jss-preset-default';

import * as SCHEMA from './schema';

import { ROOT, IFontFaceOptions, DOM, PACKAGE_NAME } from '.';

export class Stylist {
  fonts = new Map<string, IFontFaceOptions>();

  private _globalStyles: HTMLStyleElement;
  private _notebookStyles = new Map<NotebookPanel, HTMLStyleElement>();
  private _transientNotebookStyles = new Map<NotebookPanel, SCHEMA.ISettings>();
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

  registerNotebook(panel: NotebookPanel, register: boolean) {
    if (register) {
      const sheet = document.createElement('style');
      this._notebookStyles.set(panel, sheet);
      sheet.classList.add(DOM.sheet);
      sheet.classList.add(DOM.modNotebook);
      panel.content.modelContentChanged.connect(
        this._onNotebookModelContentChanged,
        this
      );
      panel.disposed.connect(this._onDisposed, this);
      this._onNotebookModelContentChanged(panel.content);
      this.hack();
    } else {
      this._onDisposed(panel);
    }
  }

  /** hoist cell metadata to data attributes */
  private _onNotebookModelContentChanged(notebook: Notebook) {
    for (const cell of notebook.widgets) {
      cell.node.dataset.jpfCellId = cell.model.id;
      let tags = [...((cell.model.metadata.get('tags') || []) as string[])].join(',');
      if (tags) {
        cell.node.dataset.jpfCellTags = `,${tags},`;
      } else {
        delete cell.node.dataset.jpfCellTags;
      }
    }
  }

  private _onDisposed(panel: NotebookPanel) {
    if (this._notebookStyles.has(panel)) {
      this._notebookStyles.get(panel)?.remove();
      this._notebookStyles.delete(panel);
      panel.disposed.disconnect(this._onDisposed, this);
      panel.content.modelContentChanged.disconnect(
        this._onNotebookModelContentChanged,
        this
      );
    }
  }

  get stylesheets() {
    return [this._globalStyles, ...Array.from(this._notebookStyles.values())];
  }

  notebooks() {
    return Array.from(this._notebookStyles.keys());
  }

  setTransientNotebookStyle(
    panel: NotebookPanel,
    style: SCHEMA.ISettings | null
  ): void {
    if (style == null) {
      this._transientNotebookStyles.delete(panel);
    } else {
      this._transientNotebookStyles.set(panel, style);
    }
    const meta = panel.model?.metadata.get(PACKAGE_NAME) as SCHEMA.ISettings;
    this.stylesheet(meta, panel);
  }

  getTransientNotebookStyle(panel: NotebookPanel): SCHEMA.ISettings | null {
    return this._transientNotebookStyles.get(panel) || null;
  }

  stylesheet(meta: SCHEMA.ISettings | null, panel?: NotebookPanel, clear = false) {
    let sheet = panel ? this._notebookStyles.get(panel) : this._globalStyles;

    let style: SCHEMA.IStyles | null = null;
    let jss: JSS.StyleSheet | null = null;
    let css: string = '';

    if (meta) {
      style = panel ? this._nbMetaToStyle(meta, panel) : this._settingsToStyle(meta);
      jss = this._jss.createStyleSheet(style as any);
      css = jss.toString();
    }

    if (panel) {
      let transientMeta = this.getTransientNotebookStyle(panel);
      if (transientMeta) {
        style = this._nbMetaToStyle(transientMeta, panel);
        jss = this._jss.createStyleSheet(style as any);
        css = `${css}\n${jss.toString()}`;
      }
    }

    if (sheet && sheet.textContent !== css) {
      sheet.textContent = css;
    }

    this.hack();
  }

  private _nbMetaToStyle(
    meta: SCHEMA.ISettings,
    notebook: NotebookPanel
  ): SCHEMA.IStyles {
    let jss: any = { '@font-face': [], '@global': {}, '@import': [] };
    const id = notebook.id;
    let idStyles: any = (jss['@global'][`.${DOM.notebookPanel}[id='${id}']`] = {});

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

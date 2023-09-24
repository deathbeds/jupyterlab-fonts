import { Cell, ICellModel } from '@jupyterlab/cells';
import { PathExt, PageConfig, URLExt } from '@jupyterlab/coreutils';
import { Notebook, NotebookPanel } from '@jupyterlab/notebook';
import { JSONExt, PromiseDelegate } from '@lumino/coreutils';
import { Debouncer } from '@lumino/polling';
import { Signal } from '@lumino/signaling';
import type * as JSS from 'jss';

import * as compat from './labcompat';
import * as SCHEMA from './schema';
import { ROOT, IFontFaceOptions, DOM, PACKAGE_NAME } from './tokens';

const RE_CSS_IMPORT = /^@import(.*$)/;
const RE_CSS_REL_URL = /url\(\s*['"]?(\.[^\)'"]+)['"]?\s*\)/g;

export class Stylist {
  fonts = new Map<string, IFontFaceOptions>();

  private _globalStyles: HTMLStyleElement;
  private _notebookStyles = new Map<NotebookPanel, HTMLStyleElement>();
  private _transientNotebookStyles = new Map<NotebookPanel, SCHEMA.ISettings>();
  private _jss: JSS.Jss | null;
  private _fontCache = new Map<string, SCHEMA.IFontFacePrimitive[]>();
  private _cacheUpdated = new Signal<this, void>(this);
  private _cellStyleCache = new Map<string, any>();
  private _notebookContentDebouncer: Debouncer;
  private _notebookCellCount = new Map<Notebook, number>();

  constructor() {
    this._globalStyles = document.createElement('style');
    this._globalStyles.classList.add(DOM.sheet);
    this._globalStyles.classList.add(DOM.modGlobal);
    this._notebookContentDebouncer = new Debouncer(async (notebook: Notebook) => {
      await this._onNotebookModelContentChanged(notebook);
    }, 100);
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
        this._debouncedNotebookContentChanged,
        this,
      );
      panel.disposed.connect(this._onDisposed, this);
      this._onNotebookModelContentChanged(panel.content)
        .then(() => this.hack())
        .catch(console.warn);
      this.hack();
    } else {
      this._onDisposed(panel);
    }
  }

  async ensureJss() {
    if (!this._jss) {
      this._jss = await Private.ensureJSS();
    }
  }

  private _debouncedNotebookContentChanged(notebook: Notebook) {
    this._notebookContentDebouncer.invoke(notebook).catch(console.warn);
  }

  /** hoist cell metadata to data attributes */
  private async _onNotebookModelContentChanged(notebook: Notebook): Promise<void> {
    const newCellCount = notebook.widgets.length;
    const oldCellCount = this._notebookCellCount.get(notebook) || -1;

    let needsUpdate = newCellCount !== oldCellCount;

    for (const cell of notebook.widgets) {
      cell.node.dataset.jpfCellId = cell.model.id;
      let tags = [
        ...((compat.getCellMetadata(cell.model, 'tags') ||
          JSONExt.emptyArray) as string[]),
      ];
      if (tags && tags.length) {
        tags.sort();
        cell.node.dataset.jpfCellTags = `,${tags.join(',')},`;
      } else {
        delete cell.node.dataset.jpfCellTags;
      }

      const meta =
        compat.getCellMetadata(cell.model, PACKAGE_NAME) || JSONExt.emptyObject;
      const cached = this._cellStyleCache.get(cell.model.id) || JSONExt.emptyObject;
      console.log(meta, cached);
      if (!JSONExt.deepEqual(meta, cached)) {
        needsUpdate = true;
      }
      this._cellStyleCache.set(cell.model.id, meta);
    }

    if (!needsUpdate) {
      return;
    }

    await this.ensureJss();

    this.stylesheet(
      notebook.model
        ? (compat.getPanelMetadata(notebook.model, PACKAGE_NAME) as SCHEMA.ISettings)
        : null,
      notebook.parent as NotebookPanel,
    );
    this._notebookCellCount.set(notebook, newCellCount);
  }

  private _onDisposed(panel: NotebookPanel) {
    if (this._notebookStyles.has(panel)) {
      this._notebookStyles.get(panel)?.remove();
      this._notebookStyles.delete(panel);
      panel.disposed.disconnect(this._onDisposed, this);
      panel.content.modelContentChanged.disconnect(
        this._debouncedNotebookContentChanged,
        this,
      );
    }
    if (this._notebookCellCount.has(panel.content)) {
      this._notebookCellCount.delete(panel.content);
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
    style: SCHEMA.ISettings | null,
  ): void {
    if (style == null) {
      this._transientNotebookStyles.delete(panel);
    } else {
      this._transientNotebookStyles.set(panel, style);
    }
    const meta = panel.model
      ? (compat.getPanelMetadata(panel.model, PACKAGE_NAME) as SCHEMA.ISettings)
      : null;
    this.stylesheet(meta, panel);
  }

  getTransientNotebookStyle(panel: NotebookPanel): SCHEMA.ISettings | null {
    return this._transientNotebookStyles.get(panel) || null;
  }

  stylesheet(meta: SCHEMA.ISettings | null, panel?: NotebookPanel) {
    if (!this._jss) {
      console.error('JSS not loaded yet');
      return;
    }
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
        css = `${css.trim()}\n${jss.toString()}`;
      }
      for (const cell of panel.content.widgets) {
        let cellMeta =
          (compat.getCellMetadata(cell.model, PACKAGE_NAME) as SCHEMA.ISettings) ||
          JSONExt.emptyObject;
        style = this._nbMetaToStyle(cellMeta, panel, cell);
        jss = this._jss.createStyleSheet(style as any);
        css = `${css.trim()}\n${jss.toString()}`;
      }
    }

    css = this._normalizeCSS(css, panel);

    if (sheet && sheet.textContent !== css) {
      sheet.textContent = css;
    }

    this.hack();
  }

  private _normalizeCSS(css: string, panel?: NotebookPanel) {
    const lines = css.split('\n');
    const finalLines: string[] = [];
    const imports: string[] = [];
    let localPath = panel?.context.localPath || null;
    if (localPath) {
      localPath = URLExt.join(
        PageConfig.getBaseUrl(),
        'files',
        PathExt.dirname(localPath),
      );
    }
    let line: string;
    for (line of lines) {
      if (localPath != null) {
        line = line.replace(RE_CSS_REL_URL, `url('${localPath}/$1')`);
      }

      let importMatch = line.match(RE_CSS_IMPORT);
      if (importMatch) {
        imports.push(line);
      } else {
        finalLines.push(line);
      }
    }
    return [...imports, ...finalLines].join('\n');
  }

  private _nbMetaToStyle(
    meta: SCHEMA.ISettings,
    panel: NotebookPanel,
    cell: Cell<ICellModel> | null = null,
  ): SCHEMA.IStyles {
    let jss: any = { '@font-face': [], '@global': {}, '@import': [] };
    let selector = `.${DOM.notebookPanel}[id='${panel.id}']`;
    if (cell) {
      selector = `${selector} .${DOM.cell}[data-jpf-cell-id="${cell.model.id}"]`;
    }

    let idStyles: any = (jss['@global'][selector] = {});

    if (meta.fonts) {
      for (let fontFamily in meta.fonts) {
        jss['@font-face'] = jss['@font-face'].concat(meta.fonts[fontFamily]);
      }
    }

    let styles = meta.styles || JSONExt.emptyObject;
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
      '@font-face': [...(flatFaces as any), ...styleFaces],
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
        0,
      );
    } else {
      this.stylesheets.map((el) => el.remove());
    }
  }
}

namespace Private {
  let _jss: JSS.Jss;
  let _loading: PromiseDelegate<JSS.Jss> | null;

  export async function ensureJSS(): Promise<JSS.Jss> {
    if (_jss) {
      return _jss;
    }
    if (!_loading) {
      _loading = new PromiseDelegate();
      const [jss, jssPresetDefault] = await Promise.all([
        import('jss'),
        import('jss-preset-default'),
      ]);
      _jss = jss.create(jssPresetDefault.default());
      _loading.resolve(_jss);
    }
    return _loading.promise;
  }
}

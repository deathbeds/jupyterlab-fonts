import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';
import * as React from 'react';

import { IFontFaceOptions } from './tokens';

import '../style/license.css';

const WRAPPER_CLASS = 'jp-LicenseViewer-wrapper';
const LICENSE_CLASS = 'jp-LicenseViewer';

export class LicenseViewer extends VDomRenderer<LicenseViewer.Model> {
  constructor(options: LicenseViewer.IOptions) {
    super(new LicenseViewer.Model(options));
  }
  protected render(): React.ReactElement<any> {
    this.addClass(WRAPPER_CLASS);
    let m = this.model;

    // Bail if there is no model.
    if (!m) {
      return <></>;
    }

    const text = m.licenseText ? <pre>{m.licenseText}</pre> : <></>;

    return (
      <div className={LICENSE_CLASS}>
        <h1>{m.font.name}</h1>
        <h2>{m.font.license.name}</h2>
        {text}
      </div>
    );
  }
}

export namespace LicenseViewer {
  export interface IOptions {
    font: IFontFaceOptions;
  }

  export class Model extends VDomModel {
    private _font: IFontFaceOptions;
    private _licenseText: string;
    private _licenseTextPromise: Promise<string>;

    constructor(options: IOptions) {
      super();
      this.font = options.font;
    }

    get font() {
      return this._font;
    }

    set font(font) {
      this._font = font;
      this.stateChanged.emit(void 0);
      this._licenseTextPromise = new Promise((resolve, reject) => {
        this._font.license
          .text()
          .then((licenseText) => {
            this._licenseText = licenseText;
            this.stateChanged.emit(void 0);
            resolve(this._licenseText);
          })
          .catch((err) => {
            reject(err);
          });
      });
    }

    get licenseText() {
      return this._licenseText;
    }

    get licenseTextPromise() {
      return this._licenseTextPromise;
    }
  }
}

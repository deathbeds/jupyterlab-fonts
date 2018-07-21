import * as React from 'react';

import {VDomModel, VDomRenderer} from '@jupyterlab/apputils';

import {IFontFaceOptions} from '.';

import '../style/license.css';

const WRAPPER_CLASS = 'jp-LicenseViewer-wrapper';
const LICENSE_CLASS = 'jp-LicenseViewer';

export class LicenseViewer extends VDomRenderer<LicenseViewer.Model> {
  protected render(): React.ReactElement<any> {
    this.addClass(WRAPPER_CLASS);
    let m = this.model;

    // Bail if there is no model.
    if (!m) {
      return;
    }

    return (
      <div className={LICENSE_CLASS}>
        <h1>{m.font.name}</h1>
        <h2>{m.font.license.name}</h2>
        <pre>{m.licenseText || '...'}</pre>
      </div>
    );
  }
}

export namespace LicenseViewer {
  export class Model extends VDomModel {
    private _font: IFontFaceOptions;
    private _licenseText: string;
    private _licenseTextPromise: Promise<string>;

    get font() {
      return this._font;
    }

    set font(font) {
      this._font = font;
      this.stateChanged.emit(void 0);
      this._licenseTextPromise = new Promise(async (resolve, reject) => {
        this._licenseText = await this._font.license.text();
        this.stateChanged.emit(void 0);
        resolve(this._licenseText);
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

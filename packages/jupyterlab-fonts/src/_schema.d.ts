/**
 * Settings for JupyterLab Fonts
 */
export interface ISettings {
  /**
   * Enable all font customizations
   */
  enabled?: boolean;
  /**
   * Reserved for future use to provide backwards compatibility
   */
  version?: string;
  /**
   * JSS-compatible JSON applied to the Global scope
   */
  styles?: ISettings.Definitions.IStyles;
}
declare namespace ISettings {
  namespace Definitions {
    export type ICSSOM = ICSSOMPrimitive | (ICSSOMPrimitive)[];
    export type ICSSOMPrimitive = string | number;
    export type IFontFace = IFontFacePrimitive[] | IFontFacePrimitive;
    export interface IFontFaceCamel {
      fontFamily: string;
      src: ICSSOM;
      'unicode-range'?: ICSSOM;
      'font-variant'?: ICSSOM;
      'font-feature-settings'?: ICSSOM;
      'font-variation-settings'?: ICSSOM;
      'font-stretch'?: ICSSOM;
      'font-weight'?: ICSSOM;
      'font-style'?: ICSSOM;
      unicodeRange?: ICSSOM;
      fontVariant?: ICSSOM;
      fontFeatureSettings?: ICSSOM;
      fontVariationSettings?: ICSSOM;
      fontStretch?: ICSSOM;
      fontWeight?: ICSSOM;
      fontStyle?: ICSSOM;
    }
    export interface IFontFaceCanonical {
      'font-family': string;
      src: ICSSOM;
      'unicode-range'?: ICSSOM;
      'font-variant'?: ICSSOM;
      'font-feature-settings'?: ICSSOM;
      'font-variation-settings'?: ICSSOM;
      'font-stretch'?: ICSSOM;
      'font-weight'?: ICSSOM;
      'font-style'?: ICSSOM;
      unicodeRange?: ICSSOM;
      fontVariant?: ICSSOM;
      fontFeatureSettings?: ICSSOM;
      fontVariationSettings?: ICSSOM;
      fontStretch?: ICSSOM;
      fontWeight?: ICSSOM;
      fontStyle?: ICSSOM;
    }
    export interface IFontFaceCommon {
      src: ICSSOM;
      'unicode-range'?: ICSSOM;
      'font-variant'?: ICSSOM;
      'font-feature-settings'?: ICSSOM;
      'font-variation-settings'?: ICSSOM;
      'font-stretch'?: ICSSOM;
      'font-weight'?: ICSSOM;
      'font-style'?: ICSSOM;
      unicodeRange?: ICSSOM;
      fontVariant?: ICSSOM;
      fontFeatureSettings?: ICSSOM;
      fontVariationSettings?: ICSSOM;
      fontStretch?: ICSSOM;
      fontWeight?: ICSSOM;
      fontStyle?: ICSSOM;
    }
    export type IFontFacePrimitive = IFontFaceCamel | IFontFaceCanonical;
    export interface IJSS {
      [name: string]: IJSS | any;
    }
    export interface IStyles {
      [name: string]: ICSSOM | IJSS;
      '@font-face'?: IFontFace;
      ':root'?: {
        [name: string]: ICSSOM;
      };
    }
  }
}

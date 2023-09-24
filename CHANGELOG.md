# Changelog

## v3.0.0a1

- remove tests and duplicated assets from wheel
- fix npm version numbers
- lazily load JSS and friends

## v3.0.0a0

- Support JupyterLab 4
- Support Notebook 7
- Fix global typefaces
- Adds UI font to the editor, commands, and menus
- Adds Atkinson Hyperlegible font

## v2.1.1

- Fix some errors when disposing notebooks
- Normalize generated CSS
- Allow for dereferencing local asset `url()`s for `@import`, etc.

## v2.1.0

- Improve notebook-level `@import`, `@font-face`, etc.
- adds `data-jpf-cell-id` and `data-jpf-cell-tags` to notebook cell elements
  - this allows notebook cells to carry their own style
- `IFontManager` supports `setTransientNotebookStyle` for dynamic styling

## v2.0.0

- Support JupyterLab 3
- Installs as a prebuilt extension, no `nodejs` required

## v1.0.1

- Fixes issue with global setting

## v1.0.0

- Support JupyterLab 2.0

## v0.7.0

- Support JupyterLab 1.0.0

## v0.6.0

- Support JupyterLab 0.35

## v0.5.0

- Support JupyterLab 0.34

## v0.4.1

- Restore content font family in editor

## v0.4.0

- Support JupyterLab 0.33

## v0.3.0

- store font data in notebooks
  - licenses
  - woff2 as base64-encoded

## v0.2.0

- add persistent configuration
- add command palette items
- adopt jss

## v0.1.1

- initial release
- fira code in four weights
- nasty hacks

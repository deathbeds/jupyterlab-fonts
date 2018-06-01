# jupyterlab-fonts

> Interactive, persistent font customization for JupyterLab, powered by
> [JSS](http://cssinjs.org).

## Installation

```bash
jupyter labextension install \
  @deathbeds/jupyterlab-fonts \
  @deathbeds/jupyterlab-font-fira-code
```

> Yes, there is only one extra font enabled at this time.
> If you previously installed `@deathbeds/jupyterlab-fonts`, you should
> remove it with
```bash
jupyter labextension uninstall @deathbeds/jupyterlab-fonts-extension
```
> Real sorry about that.

## Quick Configuration
To change your default fonts, from the main menu, select
_Settings_ ▶ _Fonts_ ▶ _Code Font_ (or _Content Font_) ▶ _Font Face_
(or _Size_ or _Line Height_) and the value you'd like.

## Full Configuration
You can view all available font configurations by selecting _Settings_ ▶
_Fonts_ ▶ _Global Fonts_. These values will be stored in your JupyterLab
settings.

### Notebook Configuration
When viewing a notebook, you can change just the fonts for that notebook by
clicking ![][fonts-icon] in the Notebook toolbar. These will be stored
in the Notebook metadata.

[fonts-icon]: ./packages/jupyterlab-fonts/style/fonts.svg

## Advanced Configuration

You can pretty much do anything you want from the _Fonts_ section of
_Advanced Settings_... even things entirely unrelated to fonts.

Here's an example of changing how the Notebook works when in Presentation
Mode. Note the use of `&`, which allows for nesting.

```json
{
  "styles": {
    ":root": {
      "--jp-code-font-family": "\"Fira Code Regular\", \"Source Code Pro\", monospace",
      "--jp-code-font-size": "19px"
    },
    ".jp-mod-presentationMode .jp-Notebook": {
      "& .CodeMirror": {
        "fontSize": "32px"
      },
      "& .jp-InputPrompt, & .jp-OutputPrompt": {
        "display": "none"
      }
    }
  }
}
```

All of the [plugins](http://cssinjs.org/plugins#jss-plugins) included in
`jss-preset-default` are enabled, with the default settings,
and at present will be wrapped in a `@global` selector.



## Development

### Before

Install:

* [conda](https://conda.io/docs/user-guide/install/download.html)

### Setup

```bash
conda env update
source activate jyve-dev
./postBuild
```

## Build Once

```bash
jlpm build
jupyter lab build
```

## Always Be Building

```bash
jlpm watch
# and in another terminal
jupyter lab --watch
```

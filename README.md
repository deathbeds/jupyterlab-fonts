# jupyterlab-fonts

> Interactive, persistent font customization for JupyterLab, powered by
> [JSS](http://cssinjs.org).

## Installation

```bash
jupyter labextension install \
  @deathbeds/jupyterlab-fonts-extension \
  @deathbeds/jupyterlab-font-fira-code
```

> Yes, there is only one extra font enabled at this time.

## Configuration

From the _Settings_ menu, select _Code Font_ and change the _Font Face_
or _Size_.

> Under the hood, these are only changing two CSS variables, namely
> `--jp-code-font-family` and `--jp-code-font-size`.

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

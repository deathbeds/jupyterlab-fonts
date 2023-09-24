# ![fonts-icon] jupyterlab-fonts

> Data-driven Style and Typography for [JupyterLab] powered by [JSS].

[jupyterlab]: https://github.com/jupyterlab/jupyterlab
[jss]: http://cssinjs.org

[![ci-badge]][ci] [![demo-badge]][demo]

[ci]:
  https://github.com/deathbeds/jupyterlab-fonts/actions?query=branch%3Amain
  'current build status of jupyterlab-fonts'
[ci-badge]:
  https://github.com/deathbeds/jupyterlab-fonts/actions/workflows/ci.yml/badge.svg
[demo]:
  https://mybinder.org/v2/gh/deathbeds/jupyterlab-fonts/main?urlpath=lab
  'an interactive demo of jupyterlab-fonts'
[demo-badge]: https://mybinder.org/badge_logo.svg

> ## This is **Free** Software
>
> We're trying some things out here, and invite you test it out, but make no guarantees
> that it is good or even works. What we mean by that is covered in the shouty text at
> the bottom of the [LICENSE].
>
> If something is broken, [become a contributor][contributing] and raise an [issue], but
> we cannot guarantee any kind of response time. Similarly, [PR]s will be reviewed on a
> time-permitting basis.

[license]:
  https://github.com/deathbeds/jupyterlab-fonts/blob/main/LICENSE
  'BSD-3-Clause'
[contributing]:
  https://github.com/deathbeds/jupyterlab-fonts/blob/main/CONTRIBUTING.md
  'contribute to jupyterlab-fonts'
[changelog]:
  https://github.com/deathbeds/jupyterlab-fonts/blob/main/CHANGELOG.md
  'the history of jupyterlab-fonts'
[pr]:
  https://github.com/deathbeds/jupyterlab-fonts/pulls
  'open pull requests to jupyterlab-fonts'
[issue]:
  https://github.com/deathbeds/jupyterlab-fonts/issues
  'open issues for jupyterlab-fonts'

# Prerequisites

- Python >=3.8
- a Jupyter client
  - JupyterLab >=3,<5
    - _for specific JupyterLab compatibility, see the [changelog]._
  - Jupyter Notebook >=7,<8

# Installing

```bash
pip install jupyterlab-fonts
# or
conda install -c conda-forge jupyterlab-fonts
```

# Uninstalling

We're sorry to see you go!

```bash
pip uninstall jupyterlab-fonts
# or
conda uninstall jupyterlab-fonts
```

# Usage

## JupyterLab

### Quick Configuration with the Jupyter Lab Menu

To change your default fonts, from the main menu, select _Settings_ ▶ _Fonts_ ▶ _Code_
▶ _Font_ (or _Size_ or _Line Height_) and the value you'd like.

Some features of _Content_, i.e. your rendered Markdown and HTML, are also available,
and more will hopefully be added over time.

### Full Configuration with the ![][fonts-icon]**Font Editor**

You can view all available font configurations by selecting _Settings_ ▶ _Fonts_ ▶
_Global Fonts..._. These values will be stored in your JupyterLab settings.

### Notebook-specific Configuration

When viewing an `.ipynb`, change just the fonts for _that file_ by clicking
![fonts-icon] in the Notebook toolbar (right now, next to cell type). The font, style
changes, and its license information will be stored in the Notebook metadata.

> This can rapidly increase the size of your notebook file, and can make it harder to
> use in collaboration. We're looking into some alterate approaches.

[fonts-icon]:
  https://raw.githubusercontent.com/deathbeds/jupyterlab-fonts/main/packages/jupyterlab-fonts/style/icons/fonts.svg

### Advanced Configuration

In JupyterLab, the _![fonts-icon] Fonts_ section of _Advanced JSON Settings_ can control
things entirely unrelated to fonts. There's no guarantee that highly-customized styles
will work nicely with the _Font Editor_, or with downstream applications of
`jupyterlab-fonts` metadata.

Here's an example of changing how a _Notebook_ file looks when in _Presentation Mode_.

```json
{
  "styles": {
    ":root": {
      "--jp-code-font-family": "'Fira Code Regular', 'Source Code Pro', monospace",
      "--jp-code-font-size": "19px"
    },
    ".jp-mod-presentationMode .jp-Notebook": {
      "& .CodeMirror, & .cm-editor": {
        "fontSize": "32px"
      },
      "& .jp-InputPrompt, & .jp-OutputPrompt": {
        "display": "none"
      }
    }
  }
}
```

### Notebooks

Similarly, the JupyterLab _Property Inspector_ enables these customizations in a
specific `.ipynb` file, at both the document and cell level: these are dynamically
generated, and scoped to the document/cell `id`.

### Supporting Multiple Application Versions

The above example shows how different versions of JupyterLab (or Notebook) may use
different DOM classes for the same logical content, such as:

| Element       | JupyterLab <4 | JupyterLab 4 |
| ------------- | ------------- | ------------ |
| a code editor | `.CodeMirror` | `.cm-editor` |

#### JSS Plugins

All JSON-compatible features of the [`jss-preset-default` plugins][jss-plugins] are
enabled with the default settings, with some specific notes below. For portability,
dynamic JS-based features are not supported.

##### Nesting

The the [`&` (ampersand)][jss-nesting] allows for nesting selectors, as standardized by
the [W3C CSS Nesting Module][nesting-w3c] and implemented in [many
browsers][nesting-browsers].

##### Global

All settings-derived styles will be wrapped in a [`@global`][jss-global] selector.

### In Jupyter Workflows

#### Use in `overrides.json`

`overrides.json` allows for simple, declarative configuration of JupyterLab core and
third-party extensions, even after the lab server has been started.

```json
{
  "@deathbeds/jupyterlab-fonts:fonts": {
    "styles": {
      ":root": {
        "--jp-code-font-family": "'Fira Code Regular', 'Source Code Pro', monospace",
        "--jp-code-font-size": "19px"
      }
    }
  }
}
```

##### Binder

In [binder], one might deploy this with a `postBuild` script:

```bash
#!/usr/bin/env bash
set -eux
mkdir -p "${NB_PYTHON_PREFIX}/share/jupyter/lab/settings"
cp overrides.json "${NB_PYTHON_PREFIX}/share/jupyter/lab/settings"
```

##### JupyterLite

Similarly, this is a well-known file to [JupyterLite][lite-well-known], making it
straightforward to do light customization without needing to build and distribute a full
theme [plugin][jupyterlab-plugins].

[jupyterlab-plugins]:
  https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html#plugins
[lite-well-known]:
  https://jupyterlite.readthedocs.io/en/latest/cli.html#well-known-files
  'JupyterLite well known files'
[binder]: https://mybinder.org
[overrides-json]:
  https://jupyterlab.readthedocs.io/en/stable/user/directories.html#overrides-json
  'JupyterLab settings overrides'
[jss-plugins]: http://cssinjs.org/plugins#jss-plugins 'JSS plugins'
[jss-nesting]:
  https://github.com/cssinjs/jss-nested#use--to-reference-selector-of-the-parent-rule
  'using nested selectors in JSS'
[jss-global]: https://cssinjs.org/jss-plugin-global 'the JSS global plugin'
[nesting-browsers]: https://caniuse.com/css-nesting 'browsers that support & nesting'
[nesting-w3c]: https://www.w3.org/TR/css-nesting-1 'the CSS nesting standard'

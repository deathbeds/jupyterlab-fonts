|           |      @deathbeds/jupyterlab-fonts      | nbjss                                             |
| --------: | :-----------------------------------: | ------------------------------------------------- |
|      what | Interactive Typography for JupyterLab | Archival HTML Typography from Notebooks           |
| ecosystem |       [JSS](http://cssinjs.org)       | [nbconvert](https://pypi.org/search/?q=nbconvert) |

[![Build Status](https://travis-ci.org/deathbeds/jupyterlab-fonts.svg?branch=master)](https://travis-ci.org/deathbeds/jupyterlab-fonts) [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/deathbeds/jupyterlab-fonts/master?urlpath=lab)

> ## This is **Experimental**, **Open Source** Software
>
> Seriously, don't try it in production.
>
> We're trying some things out here, and invite you test it out, but make no
> guarantees that it is good or even works. What we mean by that is covered in
> the shouty text at the bottom of the BSD 3-Clause [LICENSE](./LICENSE).
>
> If something is broken, [become a contributor](./CONTRIBUTING.md) and raise an
> [issue](https://github.com/deathbeds/jupyterlab-fonts/issues),
> but we cannot guarantee any kind of response time. Similarly,
> [PR](https://github.com/deathbeds/jupyterlab-fonts/pulls)s will be reviewed
> on a time-permitting basis.


# Prerequisites

> for specific JupyterLab compatibility, see the [changelog](./CHANGELOG.md).

```bash
conda install -c conda-forge jupyterlab nodejs
# or
pip install jupyterlab  # and get nodejs somehow
```

# Installing

## JupyterLab Extensions

You need to install at least the core UI `@deathbeds/jupyterlab-fonts`...

```bash
jupyter labextension install @deathbeds/jupyterlab-fonts --no-build
```

...and then one or more fonts...

```bash
jupyter labextension install @deathbeds/jupyterlab-font-anonymous-pro --no-build
jupyter labextension install @deathbeds/jupyterlab-font-dejavu-sans-mono --no-build
jupyter labextension install @deathbeds/jupyterlab-font-fira-code --no-build
```

...and then build lab...

```bash
jupyter lab build
```

## nbconvert PreProcessor (Experimental)

```bash
pip install git+https://github.com/deathbeds/jupyterlab-fonts.git
```

# Uninstalling

We're sorry to see you go!

## JupyterLab Extensions

```bash
jupyter labextension uninstall @deathbeds/jupyterlab-fonts
jupyter labextension uninstall @deathbeds/jupyterlab-font-anonymous-pro
jupyter labextension uninstall @deathbeds/jupyterlab-font-dejavu-sans-mono
jupyter labextension uninstall @deathbeds/jupyterlab-font-fira-code
```

## nbconvert PreProcessor

```bash
pip uninstall nbjss  # TBD
```

# Usage

## JupyterLab Extensions

### Quick Configuration with the Jupyter Lab Menu

To change your default fonts, from the main menu, select
_Settings_ ▶ _Fonts_ ▶ _Code_ ▶ _Font_ (or _Size_ or _Line Height_) and the
value you'd like.

Some features of _Content_, i.e. your rendered Markdown and HTML, are also
available, and more will hopefully be added over time.

### Full Configuration with the ![][fonts-icon]**Font Editor**

You can view all available font configurations by selecting _Settings_ ▶
_Fonts_ ▶ _Global Fonts..._. These values will be stored in your JupyterLab
settings.

### Notebook-specific Configuration

When viewing a notebook, you can change just the fonts for _that notebook_ by
clicking ![][fonts-icon] in the Notebook toolbar (right now, next to cell type).
The font, style changes, and its license information will be stored in the
Notebook metadata.

> This can rapidly increase the size of your notebook file, and can make it
> harder to use in collaboration. We're looking into some alterate approaches.

[fonts-icon]: ./packages/jupyterlab-fonts/style/icons/fonts.svg

### Advanced Configuration

You can pretty much do anything you want from the _Fonts_ section of
_Advanced Settings_... even things entirely unrelated to fonts.
There's no guarantee that super-customized styles will work nicely with the
Font Editor!

Here's an example of changing how the Notebook looks when in Presentation
Mode.

```json
{
  "styles": {
    ":root": {
      "--jp-code-font-family": "'Fira Code Regular', 'Source Code Pro', monospace",
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

Note the [use of `&`](nesting), which allows for nesting selectors, similar to
other CSS preprocessors like [LESS][less-nest].

[less-nest]: http://lesscss.org/features/#extend-feature-extending-nested-selectors
[nesting]: https://github.com/cssinjs/jss-nested#use--to-reference-selector-of-the-parent-rule

All of the [plugins](http://cssinjs.org/plugins#jss-plugins) included in
`jss-preset-default` are enabled, with the default settings,
and at present will be wrapped in a `@global` selector.

## nbconvert PreProcessor (experimental)

Convert a notebook to HTML with its fonts embedded by JupyterLab by adding
it to your `HTMLExporter.preprocessors`.

```bash
jupyter nbconvert --HTMLExporter.preprocessors='["nbjss.JSSHeaderPreprocessor"]' Untitled.ipynb
```

Similarly, this can be achieved by making a `jupyter_nbconvert_config.json`.

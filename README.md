# jupyterlab-fonts

> Data-driven Style and Typography for [JupyterLab] powered by [JSS].

[jupyterlab]: https://github.com/jupyterlab/jupyterlab
[jss]: http://cssinjs.org

[![ci-badge]][ci] [![demo-badge]][dmeo]

[ci]:
  https://github.com/deathbeds/jupyterlab-fonts/actions?query=branch%3Amaster
  'current build status of jupyterlab-fonts'
[ci-badge]:
  https://github.com/deathbeds/jupyterlab-fonts/actions/workflows/ci.yml/badge.svg
[demo]:
  https://mybinder.org/v2/gh/deathbeds/jupyterlab-fonts/master?urlpath=lab
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
  https://github.com/deathbeds/jupyterlab-fonts/blob/master/LICENSE
  'BSD-3-Clause'
[contributing]:
  https://github.com/deathbeds/jupyterlab-fonts/blob/master/CONTRIBUTING.md
  'contribute to jupyterlab-fonts'
[changelog]:
  https://github.com/deathbeds/jupyterlab-fonts/blob/master/CHANGELOG.md
  'the history of jupyterlab-fonts'
[pr]:
  https://github.com/deathbeds/jupyterlab-fonts/pulls
  'open pull requests to jupyterlab-fonts'
[issue]:
  https://github.com/deathbeds/jupyterlab-fonts/issues
  'open issues for jupyterlab-fonts'

# Prerequisites

- JupyterLab >=3
- Python >=3.7

> for specific JupyterLab compatibility, see the [changelog].

# Installing

```bash
pip install jupyterlab-fonts
# or
conda install -c conda-forge jupyterlab-fonts
```

# Uninstalling

We're sorry to see you go!

## JupyterLab Extensions

```bash
pip uninstall jupyterlab-fonts
# or
conda uninstall jupyterlab-fonts
```

# Usage

## JupyterLab Extensions

### Quick Configuration with the Jupyter Lab Menu

To change your default fonts, from the main menu, select _Settings_ ▶ _Fonts_ ▶ _Code_ ▶
_Font_ (or _Size_ or _Line Height_) and the value you'd like.

Some features of _Content_, i.e. your rendered Markdown and HTML, are also available,
and more will hopefully be added over time.

### Full Configuration with the ![][fonts-icon]**Font Editor**

You can view all available font configurations by selecting _Settings_ ▶ _Fonts_ ▶
_Global Fonts..._. These values will be stored in your JupyterLab settings.

### Notebook-specific Configuration

When viewing a notebook, you can change just the fonts for _that notebook_ by clicking
![][fonts-icon] in the Notebook toolbar (right now, next to cell type). The font, style
changes, and its license information will be stored in the Notebook metadata.

> This can rapidly increase the size of your notebook file, and can make it harder to
> use in collaboration. We're looking into some alterate approaches.

[fonts-icon]: ./packages/jupyterlab-fonts/style/icons/fonts.svg

### Advanced Configuration

You can pretty much do anything you want from the _Fonts_ section of _Advanced
Settings_... even things entirely unrelated to fonts. There's no guarantee that
super-customized styles will work nicely with the _Font Editor_!

Here's an example of changing how the Notebook looks when in _Presentation Mode_.

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

Note the [use of `&`][nesting], which allows for nesting selectors, similar to other CSS
preprocessors like [LESS].

All of the [plugins] included in `jss-preset-default` are enabled, with the default
settings, and at present will be wrapped in a `@global` selector.

[plugins]: http://cssinjs.org/plugins#jss-plugins 'JSS plugins'
[less]: http://lesscss.org/features/#extend-feature-extending-nested-selectors
[nesting]:
  https://github.com/cssinjs/jss-nested#use--to-reference-selector-of-the-parent-rule
  'using nested selectors'

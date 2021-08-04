# Contributing

We would love to have contributions of

- additional fonts
- additional strategies for making fonts available

## Development

### Before

Install:

- [conda](https://conda.io/docs/user-guide/install/download.html)

### Setup

```bash
conda env update
conda activate jupyterlab-fonts-dev
jlpm bootstrap  # this takes a while
jupyter lab --no-browser --debug
```

## Build Once

```bash
jlpm build
```

## Always Be Building

```bash
jlpm watch
```

Starts:

- a JSON schema to typescript process
- a typescript build process
- jupyterlab in build mode

## Thinking about Committing

```bash
jlpm lint
jlpm test
```

## Design Principles

> Note: PRs will be reviewed on a time-permitting basis!

## Adding a Font

While anyone can add more fonts as an extension, fonts included and maintained in this
monorepo should be:

- licensed and attributed for redistribution
- available in `woff2` format
- tested

If there is an `npm` upstream for your font, great! However, if it ships every possible
font format and weight, you should probably vendor it. For an example, see
[jupyterlab-font-dejavu-sans-mono](./packages/jupyterlab-font-dejavu-sans-mono).

## Adding a Strategy

For a number of reasons, this project is not going to go out of its way to support using
fonts requiring your users to download fonts from the wild internet. However, if you
were to build an extension for Google Fonts, TypeKit, or other sources of fonts, we
would accept any PRs, pending review, that made this process more sane and secure.

For the nbconvert preprocessor, other strategies, like external files, would be
nice-to-have.

## Changing the schema

Aside from being difficult to develop, schema changes need to be addressed very
gingerly: ideally, we would have a pattern for upgrading and downgrading font metadata
on both the frontend and backend.

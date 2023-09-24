# Contributing

We would love to have contributions of:

- additional fonts
- additional strategies for making fonts available

## Development

### Before

- Install [mambaforge](https://github.com/conda-forge/miniforge/releases/)

### Setup

```bash
mamba create --file .github/locks/lock_linux-64.conda.lock --prefix ./.envs/lock
source ./.envs/lock/bin/activate
doit list
```

## Build Once

```bash
doit dist
```

## Lab

```bash
doit lab
```

### More Labs

Create a `.env` file:

```ini
# .env
JLF_LAB=lab3.5  # default: lab4.0
```

then

```bash
doit lab
```

## Testing

```bash
doit test
```

### Advanced testing

#### JS Bundle analysis

Create a `.env` file:

```ini
WITH_JS_VIZ=1
```

Then run:

```bash
doit dist
```

See `build/reports/webpack`.

#### JS Coverage

Create a `.env` file:

```ini
WITH_JS_COV=1
```

Run

```bash
doit test
# run some other excursions, by env var or `.env` file e.g.
# JLF_LAB=lab3.5 doit test
doit report
```

See `build/reports/nyc/index.html`.

## Thinking about Committing

```bash
doit fix lint dist test
```

## Updating environments

- change the files in `.github/specs`
- run `doit lock:solve:*`
- commit `.github/locks`

## Releasing

- make a release issue
- ensure the CHANGELOG is updated
- wait for CI
- download the dist
- make a GitHub release off `main`
- upload the assets
- upload to PyPI, npm
- handle conda-forge chores
- post-mortem

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

For the `nbconvert` preprocessor, other strategies, like external files, would be
nice-to-have.

## Changing the Schema

Aside from being difficult to develop, schema changes need to be addressed very
gingerly: ideally, we would have a pattern for upgrading and downgrading font metadata
on both the frontend and backend.

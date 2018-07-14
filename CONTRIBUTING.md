## Contributing

We would love to have contributions of

- [ ] additional fonts
- [ ] additional strategies for making fonts available

> Note: PRs will be reviewed on a time-permitting basis!

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

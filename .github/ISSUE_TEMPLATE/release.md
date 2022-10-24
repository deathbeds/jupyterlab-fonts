---
name: Release
about: Prepare for a release
labels: maintenance
---

- [ ] merge all outstanding PRs
- [ ] ensure the versions have been bumped (check with `doit`)
- [ ] ensure the CHANGELOG is up-to-date
  - [ ] move the new release to the top of the stack
- [ ] validate on binder
- [ ] wait for a successful build of `main`
- [ ] download the `dist` archive and unpack somewhere (maybe a fresh `dist`)
- [ ] create a new release through the GitHub UI
  - [ ] paste in the relevant CHANGELOG entries
  - [ ] upload the artifacts
- [ ] actually upload to npm.com, pypi.org
  ```bash
  cd dist
  twine upload *.tar.gz *.whl
  npm login
  for tarball in deathbeds-jupyterlab-font*.tar.gz; do
    npm publish .tgz
  done
  npm logout
  ```
- [ ] postmortem
  - [ ] handle `conda-forge` feedstock tasks
  - [ ] validate on binder via simplest-possible gists
  - [ ] bump to next development version
  - [ ] update release procedures

#!/usr/bin/env bash
if [ -z ${CONDA_PREFIX+x} ]; then
  echo "Sorry, you need to be in an activated conda environment"
  exit 1
fi

export PACKAGES=./packages
export DEATHBEDS_PACKAGES=$CONDA_PREFIX/share/jupyter/lab/staging/node_modules/@deathbeds

export SCHEMA=./packages/jupyterlab-fonts-extension/schema
export DEATHBEDS_SCHEMA=$CONDA_PREFIX/share/jupyter/lab/schemas/@deathbeds/jupyterlab-fonts

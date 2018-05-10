#!/usr/bin/env bash
if [ -z ${CONDA_PREFIX+x} ]; then
  echo "Sorry, you need to be in an activated conda environment"
  exit 1
fi

export DEATHBEDS=$CONDA_PREFIX/share/jupyter/lab/staging/node_modules/@deathbeds
export PACKAGES=./packages

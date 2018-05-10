#!/usr/bin/env bash
. ./scripts/env.sh

mkdir -p $DEATHBEDS

rsync -aqz --del $PACKAGES/ $DEATHBEDS/

# yeah, and whatever
rm -rf $DEATHBEDS/*/node_modules/@deathbeds

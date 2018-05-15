#!/usr/bin/env bash
. ./scripts/env.sh

mkdir -p $DEATHBEDS_PACKAGES
mkdir -p $DEATHBEDS_SCHEMA

rsync -aqz --del $PACKAGES/ $DEATHBEDS_PACKAGES/
rsync -aqz --del $SCHEMA/ $DEATHBEDS_SCHEMA/

# yeah, and whatever
rm -rf $DEATHBEDS_PACKAGES/*/node_modules/@deathbeds

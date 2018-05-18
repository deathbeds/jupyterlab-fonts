#!/usr/bin/env bash
. ./scripts/env.sh

mkdir -p $DEATHBEDS_PACKAGES
mkdir -p $DEATHBEDS_SCHEMA

rsync -aqz --no-links --del $PACKAGES/ $DEATHBEDS_PACKAGES/
rsync -aqz --no-links --del $SCHEMA/ $DEATHBEDS_SCHEMA/

# yeah, and whatever
rm -rf $DEATHBEDS_PACKAGES/*/node_modules/@deathbeds

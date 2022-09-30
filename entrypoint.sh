#!/bin/sh

# set -xe

echo "Hello $INPUT_STEAMPIPE_VERSION"
if [ "$INPUT_STEAMPIPE_VERSION" == "latest" ]
then
  echo "latest"
else
  echo "not latest"
fi
uname -m
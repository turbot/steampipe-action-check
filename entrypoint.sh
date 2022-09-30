#!/bin/sh

set -xe

echo "Hello $1"
if ["$1" == "latest"]
then
  echo "latest"
else
  echo "not latest"
fi

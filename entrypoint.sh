#!/bin/bash

set -xe

echo "Hello $STEAMPIPE_VERSION"
if ["$STEAMPIPE_VERSION" == "latest"]; then
  echo "latest"
else
  echo "not latest"
fi

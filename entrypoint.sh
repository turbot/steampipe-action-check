#!/bin/sh

# set -xe

echo "Hello $INPUT_STEAMPIPE_VERSION"
if [ "$INPUT_STEAMPIPE_VERSION" == "latest" ]
then
  echo "latest"
  wget "https://github.com/turbot/steampipe/releases/latest/download/steampipe_linux_amd64.tar.gz"
else
  echo "not latest"
  wget "https://github.com/turbot/steampipe/releases/download/v0.16.4/steampipe_linux_amd64.tar.gz"
fi
uname -mp
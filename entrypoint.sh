#!/bin/sh

set -xe

SP=$(which steampipe)

INSTALL_DIR=/install
PLUGIN_NAME=terraform

RunList=()
if [ -z "$RUN" ];then
  RunList=("all")
else
  while read -r line; do
    RunList+=("$line")
  done <<< "$RUN"
fi

$SP query "select 1" --install-dir $INSTALL_DIR

setup_plugin()
{
  $SP plugin install $PLUGIN_NAME --install-dir $INSTALL_DIR
  
  connection_data="
connection \"terraform\" {
  plugin = \"terraform\"
  paths = [ \"$INPUT_PATHS/**/*.tf\" ]
}
"

  # Add config file
  echo $connection_data >> $INSTALL_DIR/config/terraform.spc
  echo "Wrote connection file:"
  cat $INSTALL_DIR/config/terraform.spc
  echo "<<<<<<<<<<<<<<<<<<<<<<"
}

run_infra_check() {
  if $SP check ${RunList[@]} --export=json --mod-location=/workspace; then
    echo "S"
  else
    echo "F"
  fi
}

setup_plugin

# Mod installation
git clone --depth 1 $INPUT_MOD_URL /workspace

run_infra_check

node /js-app/index.js benchmark.b1 benchmark.b2

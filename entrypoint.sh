#!/bin/sh

set -xe

readonly INSTALL_DIR=/install
readonly PLUGIN_NAME=terraform

RunList=()
if [ -z "$INPUT_RUN" ]; then
  RunList=("all")
else
  while read -r line; do
    RunList+=("$line")
  done <<< "$INPUT_RUN"
fi

steampipe query "select 1" --install-dir "$INSTALL_DIR"

setup_plugin()
{
  steampipe plugin install "$PLUGIN_NAME" --install-dir "$INSTALL_DIR"
  
  connection_data="
connection \"terraform\" {
  plugin = \"terraform\"
  paths = [ \"$INPUT_PATHS/**/*.tf\" ]
}
"

  # Add config file
  echo "$connection_data" >> "$INSTALL_DIR/config/terraform.spc"
  echo "Wrote connection file:"
  cat "$INSTALL_DIR/config/terraform.spc"
  echo "<<<<<<<<<<<<<<<<<<<<<<"
}

run_infra_check() {
  if steampipe check ${RunList[@]} --export=json --mod-location=/workspace; then
    echo "S"
  else
    echo "F"
    exit 1 # Exit with non-zero status code to indicate failure
  fi
}

setup_plugin
git clone --depth 1 $INPUT_MOD_URL /workspace
run_infra_check
node /js-app/index.js ${RunList[@]}

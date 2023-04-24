#!/bin/sh

set -e

INSTALL_DIR=~/install
PLUGIN_NAME=terraform

RunList=

if [ -z "$INPUT_RUN" ]
then
  RunList="all"
else
  while read line; do
    RunList="$RunList $line"
  done <<EOF
$INPUT_RUN
EOF
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
  printf '%s\n' "$connection_data" >> "$INSTALL_DIR/config/terraform.spc"
  printf '%s\n' "Wrote connection file:"
  cat "$INSTALL_DIR/config/terraform.spc"
  printf '%s\n' "<<<<<<<<<<<<<<<<<<<<<<"
}

run_infra_check() {
  if steampipe check $RunList --export=json --mod-location=/workspace
  then
    echo "S"
  else
    echo "F"
    exit 1
  fi
}

setup_plugin
git clone --depth 1 "$INPUT_MOD_URL" /workspace
run_infra_check
node /js-app/index.js $RunList

#!/bin/sh

set -e

# update the access flags so that the steampipe user can write to it
chmod -R 777 $GITHUB_WORKSPACE
chown -R steampipe:0 $GITHUB_WORKSPACE

# switch to the non-root steampipe user which we inherit from the base image
su steampipe

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

steampipe query "select 1"

setup_plugin()
{
  steampipe plugin install "$PLUGIN_NAME"

  connection_data="
connection \"terraform\" {
  plugin = \"terraform\"
  paths = [ \"$INPUT_PATHS/**/*.tf\" ]
}
"

  # Add config file
  printf '%s\n' "$connection_data" > "/home/steampipe/.steampipe/config/terraform.spc"
  printf '%s\n' "Wrote connection file:"
  cat /home/steampipe/.steampipe/config/terraform.spc
  printf '%s\n' "<<<<<<<<<<<<<<<<<<<<<<"
}

run_infra_check() {
  if steampipe check $RunList --output=none --export=json --mod-location=/workspace
  then
    echo "S"
  else
    echo "F"
  fi
}

setup_plugin
git clone --depth 1 "$INPUT_MOD_URL" /workspace
run_infra_check
node /js-app/index.js $RunList

#!/bin/sh

# set -xe
pwd
cd /home/default
whoami
if [ "$INPUT_STEAMPIPE_VERSION" == "latest" ]
then
  echo "latest"
  # wget -c "https://github.com/turbot/steampipe/releases/latest/download/steampipe_linux_amd64.tar.gz" -O - | tar -xz
  wget -c "https://github.com/turbot/steampipe/releases/latest/download/steampipe_linux_amd64.tar.gz" && tar -xzf  steampipe_linux_amd64.tar.gz -C /home/default
    # wget -c "https://github.com/turbot/steampipe/releases/latest/download/steampipe_linux_amd64.tar.gz"
    # chmod 777 ./steampipe_linux_amd64.tar.gz
    # tar -xzf  ./steampipe_linux_amd64.tar.gz -C ./
  /home/default/steampipe query "select 1"

else
  echo "not latest"
  # wget -c "https://github.com/turbot/steampipe/releases/download/v0.16.4/steampipe_linux_amd64.tar.gz" -O - | tar -xz
  wget -c "https://github.com/turbot/steampipe/releases/download/v0.16.4/steampipe_linux_amd64.tar.gz" && tar -xzf  steampipe_linux_amd64.tar.gz -C /home/default
    # wget -c "https://github.com/turbot/steampipe/releases/download/v0.16.4/steampipe_linux_amd64.tar.gz"
    # chmod 777 ./steampipe_linux_amd64.tar.gz
    # tar -xzf  ./steampipe_linux_amd64.tar.gz -C ./
  whoami
  /home/default/steampipe query "select 1"
fi



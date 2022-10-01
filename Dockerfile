FROM turbot/steampipe

# Setup prerequisites (as root)
ARG mod_url
ARG plugin
ARG steampipe_version

USER root:0
RUN apt-get update -y \
 && apt-get install -y git
RUN echo $steampipe_version
# Install the aws and steampipe plugins for Steampipe (as steampipe user).
USER steampipe:0
RUN  steampipe plugin install $plugin

# A mod may be installed to a working directory
RUN  git clone --depth 1 $mod_url /workspace
WORKDIR /workspace

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["./entrypoint.sh"]
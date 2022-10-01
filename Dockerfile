FROM turbot/steampipe

# Setup prerequisites (as root)
USER root:0
RUN apt-get update -y \
 && apt-get install -y git
RUN echo $INPUT_STEAMPIPE_VERSION
# Install the aws and steampipe plugins for Steampipe (as steampipe user).
USER steampipe:0
RUN  steampipe plugin install steampipe $INPUT_PLUGIN

# A mod may be installed to a working directory
RUN  git clone --depth 1 $INPUT_MOD_URL /workspace
WORKDIR /workspace

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["./entrypoint.sh"]
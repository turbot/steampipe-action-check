FROM turbot/steampipe

# Setup prerequisites (as root)
USER root:0

RUN apt-get update -y \
 && apt-get install -y git
 
RUN echo $steampipe_version
# Install the aws and steampipe plugins for Steampipe (as steampipe user).
USER steampipe:0

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["./entrypoint.sh"]
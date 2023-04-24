FROM turbot/steampipe

# Setup prerequisites (as root)
USER root:0

RUN apt-get update -y \
 && apt-get install -y git
 
RUN echo $steampipe_version

USER steampipe:0

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["./entrypoint.sh"]
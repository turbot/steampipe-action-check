ARG INPUT_STEAMPIPE_VERSION="latest"
FROM ghcr.io/turbot/steampipe:${INPUT_STEAMPIPE_VERSION}
LABEL maintainer="Turbot Support <help@turbot.com>"

USER root
RUN apt update
RUN apt-get update -y && apt-get install -y git curl
RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
RUN apt install -y nodejs

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# update the access flags so that the steampipe user can write to it
RUN chmod -R 777 $GITHUB_WORKSPACE

# switch to the non-root steampipe user which we inherit from the base image
USER steampipe

COPY ./dist /js-app

ENTRYPOINT ["/entrypoint.sh"]

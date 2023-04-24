ARG INPUT_STEAMPIPE_VERSION="latest"
FROM ghcr.io/turbot/steampipe:${INPUT_STEAMPIPE_VERSION}
LABEL maintainer="Turbot Support <help@turbot.com>"

USER root
RUN apt update
RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
RUN apt install -y nodejs

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create a group and user
RUN addgroup --system steampipegroup
RUN adduser --system steampipeuser --ingroup steampipegroup

# Tell docker that all future commands should run as the appuser user
USER steampipeuser

COPY ./src /js-app

ENTRYPOINT ["/entrypoint.sh"]

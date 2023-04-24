FROM node:20-alpine3.16

RUN apk --no-cache add curl

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create a group and user
RUN addgroup -S steampipegroup && adduser -S steampipeuser -G steampipegroup

# Tell docker that all future commands should run as the appuser user
USER steampipeuser

COPY ./src /js-app

ENTRYPOINT ["/entrypoint.sh"]

FROM node:20-alpine3.16

RUN apk --no-cache add curl

# Create a group and user
RUN addgroup -S steampipegroup && adduser -S steampipeuser -G steampipegroup

# Tell docker that all future commands should run as the appuser user
USER steampipeuser

COPY ./entrypoint.sh /entrypoint.sh
COPY ./src /js-app

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

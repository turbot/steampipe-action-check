FROM node:20-alpine3.16

RUN apk --no-cache add curl

# Add a new user "john" with user id 8877
RUN useradd -u 8877 steampipe
# Change to non-root privilege
USER steampipe

COPY ./entrypoint.sh /entrypoint.sh
COPY ./src /js-app

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

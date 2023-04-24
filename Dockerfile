FROM node:20-alpine3.16

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN apk --no-cache add curl

COPY ./src /js-app

# Add a new user "john" with user id 8877
RUN useradd -u 8877 steampipe
# Change to non-root privilege
USER steampipe

ENTRYPOINT ["/entrypoint.sh"]

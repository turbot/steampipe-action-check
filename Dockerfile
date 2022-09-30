# Container image that runs your code
FROM alpine:3.10

# RUN apk --no-cache --update add bash git \
#     && rm -rf /var/cache/apk/*

# Add a new user "john" with user id 8877
RUN useradd -u 8877 john
# Change to non-root privilege
USER john


# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]
# Container image that runs your code
FROM alpine:3.10

# RUN apk --no-cache --update add bash git \
#     && rm -rf /var/cache/apk/*

# Add a new user "nonroot" with user id 8877
RUN adduser -u 8877 --disabled-password nonroot
# Change to non-root privilege
# USER nonroot


# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]
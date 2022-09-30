# Container image that runs your code
FROM alpine:3.10

ARG USER=default
ENV HOME /home/$USER

# RUN apk --no-cache --update add bash git \
#     && rm -rf /var/cache/apk/*

# Add a new user "nonroot" with user id 8877
# RUN adduser -u 8877 -D -S nonroot
# Change to non-root privilege
# USER nonroot

# install sudo as root
RUN apk add --update sudo

# add new user
RUN adduser -D $USER \
        && echo "$USER ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/$USER \
        && chmod 0440 /etc/sudoers.d/$USER

USER $USER
WORKDIR $HOME

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]
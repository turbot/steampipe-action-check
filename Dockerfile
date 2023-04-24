FROM gcr.io/distroless/nodejs20-debian11

RUN apk --no-cache --update add \
    curl \
    git \
    && rm -rf /var/cache/apk/*

COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

COPY ./ /app

ENTRYPOINT ["/entrypoint.sh"]

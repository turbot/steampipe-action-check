FROM gcr.io/distroless/nodejs20-debian11

COPY ./entrypoint.sh /entrypoint.sh

COPY ./src /js-app

ENTRYPOINT ["/entrypoint.sh"]

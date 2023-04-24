FROM gcr.io/distroless/nodejs20-debian11

COPY --chmod=+x ./entrypoint.sh /entrypoint.sh

COPY ./src /js-app

ENTRYPOINT ["/entrypoint.sh"]

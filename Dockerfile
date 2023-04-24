FROM node:20-alpine3.16

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY ./src /js-app

ENTRYPOINT ["/entrypoint.sh"]

FROM alpine:latest

RUN apk add --no-cache curl jq bash

COPY kong-setup.sh /kong-setup.sh
RUN chmod +x /kong-setup.sh

CMD ["/bin/bash", "/kong-setup.sh"]
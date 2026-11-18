FROM golang:1.27.4-alpine3.24 AS dev

RUN apk add --no-cache git

RUN git config --global --add safe.directory /app

WORKDIR /app

ENV CGO_ENABLED=0

COPY server/go.mod server/go.sum* ./
RUN go mod download

COPY server/ ./

EXPOSE 3001

ENTRYPOINT ["tail", "-f", "/dev/null"]

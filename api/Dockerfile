FROM golang:1.26.4-alpine AS builder
WORKDIR /src

COPY go.mod go.sum ./
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /out/api .

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /out/api /api

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/api"]

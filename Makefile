.PHONY: start-api test-api

start-api:
	cd api && go tool air

test-api:
	cd api && go test ./... -cover

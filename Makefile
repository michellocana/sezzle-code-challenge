.PHONY: start-api test-api start-web test-web

start-api:
	cd api && go tool air

test-api:
	cd api && go test ./... -cover

start-web:
	cd web && npm run dev

test-web:
	cd web && npm test

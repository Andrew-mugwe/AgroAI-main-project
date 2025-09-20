.PHONY: build test lint verify deps

build:
	go build ./...

test:
	go test ./... -v

lint:
	golangci-lint run ./...

verify: deps build test lint
	@echo "All verification steps completed."

deps:
	@echo "Installing dev tools..."
	@if ! command -v golangci-lint >/dev/null 2>&1; then \
		curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh \
		| sh -s -- -b $(shell go env GOPATH)/bin v1.60.0 || true; \
	fi

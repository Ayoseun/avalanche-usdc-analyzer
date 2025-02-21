SHELL := /bin/bash

run-script:
	@echo "Running script.sh..."
	@chmod +x ./scripts/script.sh
	@./scripts/script.sh

	@echo "Installing dependencies..."
	@npm install

	@echo "Running migrations..."
	@npm run migration:run

	@echo "Building Docker image..."
	@docker build -t my-app .

	@echo "Starting services with Docker Compose..."
	@docker compose up -d

.PHONY: run-script

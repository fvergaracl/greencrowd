SERVICE_NAME=appgc

GIT_COMMIT_HASH=$(shell git rev-parse --short HEAD)

build:
	@echo "Building Docker image with GIT_COMMIT_HASH=$(GIT_COMMIT_HASH)"
	@GIT_COMMIT_HASH=$(GIT_COMMIT_HASH) docker-compose up --build --force-recreate

up:
	@docker-compose up -d

down:
	@docker-compose down

check-env:
	@docker-compose exec $(SERVICE_NAME) printenv | grep GIT_COMMIT_HASH

shell:
	@docker-compose exec $(SERVICE_NAME) sh

#!/bin/bash

# Check if "docker-compose" or "docker compose" is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "[ERROR] Neither 'docker-compose' nor 'docker compose' is installed. Exiting."
    exit 1
fi

# Check if the network "greencrowd" exists, create it if it doesn't
if ! docker network ls | grep -q "greencrowd"; then
    echo "[INFO] The network 'greencrowd' does not exist. Creating network..."
    docker network create greencrowd
else
    echo "[INFO] The network 'greencrowd' already exists."
fi

# Run Docker Compose with the selected command
$COMPOSE_CMD -f docker-compose-dev.yml up --build

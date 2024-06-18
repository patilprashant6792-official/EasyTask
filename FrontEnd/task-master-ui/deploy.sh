#!/bin/bash

# Stop any running containers
docker-compose down

# Build and start the containers
docker-compose up --build -d

# Show running containers
docker-compose ps

#!/bin/bash

set -e


# Step 1: Build and deploy Docker containers
echo "Building and deploying Docker containers..."
docker-compose up --build -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 15

# Step 2: Backend health check
echo "Performing backend health check..."
BACKEND_HEALTH_URL="http://localhost:5000/api/health"
BACKEND_HEALTH_RESPONSE=$(curl --silent --write-out "HTTPSTATUS:%{http_code}" -X GET $BACKEND_HEALTH_URL)
BACKEND_HEALTH_BODY=$(echo $BACKEND_HEALTH_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')
BACKEND_HEALTH_STATUS=$(echo $BACKEND_HEALTH_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$BACKEND_HEALTH_STATUS" -ne 200 ]; then
  echo "Backend health check failed with status $BACKEND_HEALTH_STATUS"
  echo "Response: $BACKEND_HEALTH_BODY"
  exit 1
else
  echo "Backend health check passed"
fi


echo "Deployment completed successfully"

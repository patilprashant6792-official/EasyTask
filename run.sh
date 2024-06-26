#!/bin/bash

set -e

# Define paths
FRONTEND_DIR="FrontEnd/task-master-ui"
BACKEND_DIR="Backend/TaskMaster"

# Step 1: Deploy backend
echo "Deploying backend..."
cd $BACKEND_DIR
chmod +x deploy.sh
./deploy.sh

echo "Deployment completed successfully"

cd ..
cd ..


# Step 2: Deploy frontend
echo "Deploying frontend..."
cd $FRONTEND_DIR
chmod +x deploy.sh
./deploy.sh

# Return to EasyTask root directory
cd ../../..

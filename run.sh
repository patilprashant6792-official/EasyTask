#!/bin/bash

set -e

# Define paths
FRONTEND_DIR="FrontEnd/task-master-ui"
BACKEND_DIR="Backend/TaskMaster"


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

cd ../../..

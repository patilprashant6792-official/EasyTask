# EasyTask Deployment Guide

## Introduction
This guide provides step-by-step instructions to deploy the EasyTask project. The project consists of a frontend and a backend, each with its own deployment script. The main deployment script, `run.sh`, located in the `EasyTask` directory, will orchestrate the deployment of both the frontend and backend.

## Prerequisites
Ensure the following prerequisites are met before starting the deployment:
1. **Docker**: Make sure Docker is installed on your system. You can download Docker from [here](https://www.docker.com/get-started).
2. **Docker Engine**: Ensure Docker Engine is running. You can start Docker Engine with the following command:
    ```sh
    sudo systemctl start docker
    ```

## Deployment Steps

### Step 1: Clone the Repository
Clone the EasyTask repository to your local machine using the following command:

git clone https://github.com/patilprashant6792-official/EasyTask.git

### Step 2: Navigate to the EasyTask Directory
Change to the EasyTask directory:
cd EasyTask

### Step 3: Provide Execute Permission to run.sh
Ensure the run.sh script has execute permissions. You can set the permissions using the following command:

chmod +x ./run.sh

### Step 4:Run the run.sh Script
Execute the run.sh script to deploy both the frontend and backend:

./run.sh

### Step 5:Hit 'http://localhost:3000'
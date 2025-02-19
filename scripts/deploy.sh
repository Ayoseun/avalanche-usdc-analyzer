#!/bin/bash

# Build the Docker image
docker build -t avalanche-usdc-analyzer .

# Push the Docker image to a container registry (e.g., Docker Hub)
docker tag avalanche-usdc-analyzer:latest ayoseun/avalanche-usdc-analyzer:latest
docker push ayoseun/avalanche-usdc-analyzer:latest

# Deploy to your server or cloud provider
# Example for a simple SSH deployment
ssh user@your-server << EOF
  docker pull your-dockerhub-username/avalanche-usdc-analyzer:latest
  docker stop avalanche-usdc-analyzer || true
  docker run -d --name avalanche-usdc-analyzer -p 3000:3000 your-dockerhub-username/avalanche-usdc-analyzer:latest
EOF

#!/bin/bash

# Build the Docker image
docker build -t avalanche-usdc-analyzer .

# Push the Docker image to a container registry (e.g., Docker Hub)
docker tag avalanche-usdc-analyzer:latest ayoseun/avalanche-usdc-analyzer:latest
docker push ayoseun/avalanche-usdc-analyzer:latest


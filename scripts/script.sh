


# Build the Docker images
docker build -t avalanche-redis -f ./scripts/Dockerfile.redis .
docker build -t avalanche_db -f ./scripts/Dockerfile.postgres .


# Run the Docker containers
docker run -d --name avalanche_cache -p 6379:6379 avalanche-redis
docker run -d --name avalanche_db -p 5432:5432 avalanche_db

docker run -d --name pgadmin -p 8080:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@example.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  dpage/pgadmin4






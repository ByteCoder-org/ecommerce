# Wait for Kong to be ready
echo "Waiting for Kong to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if curl -s http://kong:8001/status > /dev/null 2>&1; then
    echo "Kong is ready! Configuring..."
    break
  fi

  attempt=$((attempt+1))
  echo "Attempt $attempt/$max_attempts: Kong not ready yet, waiting..."
  sleep 5

  if [ $attempt -eq $max_attempts ]; then
    echo "Kong did not become ready in time. Checking Kong logs:"
    curl -s http://kong:8001 || echo "Kong admin API not responding"
    exit 1
  fi
done

# Create Keycloak service
echo "Creating Keycloak service in Kong..."
curl -s -X PUT http://kong:8001/services/keycloak-service \
  --data "url=http://keycloak:8080" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Create route for Keycloak service
echo "Creating route for Keycloak service..."
curl -s -X POST http://kong:8001/services/keycloak-service/routes \
  --data "name=keycloak-route" \
  --data "paths[]=/auth" \
  --data "paths[]=/auth/" \
  --data "strip_path=false" \
  --data "preserve_host=true" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Enable CORS plugin for the Keycloak service
echo "Enabling CORS for Keycloak service..."
curl -s -X POST http://kong:8001/services/keycloak-service/plugins \
  --data "name=cors" \
  --data "config.origins=*" \
  --data "config.methods=GET,POST,PUT,DELETE,OPTIONS,PATCH" \
  --data "config.headers=Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,Authorization" \
  --data "config.exposed_headers=Authorization" \
  --data "config.credentials=true" \
  --data "config.max_age=3600" \
  -H "Content-Type: application/x-www-form-urlencoded"#!/bin/bash
set -e

# Create product service
echo "Creating product service in Kong..."
curl -s -X PUT http://kong:8001/services/product-service \
  --data "url=http://product-service:8081" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Create route for product service
echo "Creating route for product service..."
curl -s -X POST http://kong:8001/services/product-service/routes \
  --data "name=product-api" \
  --data "paths[]=/api/v1/products" \
  --data "strip_path=false" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Enable CORS plugin for the product service
echo "Enabling CORS for product service..."
curl -s -X POST http://kong:8001/services/product-service/plugins \
  --data "name=cors" \
  --data "config.origins=*" \
  --data "config.methods=GET,POST,PUT,DELETE,OPTIONS,PATCH" \
  --data "config.headers=Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,Authorization" \
  --data "config.exposed_headers=Authorization" \
  --data "config.credentials=true" \
  --data "config.max_age=3600" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Create OpenID Connect plugin for the product service
echo "Setting up OpenID Connect plugin..."
curl -s -X POST http://kong:8001/services/product-service/plugins \
  --data "name=openid-connect" \
  --data "config.issuer=http://keycloak:8080/realms/ecommerce" \
  --data "config.client_id=ecommerce-app" \
  --data "config.client_auth=none" \
  --data "config.auth_methods=bearer" \
  --data "config.bearer_token_param_type=header" \
  --data "config.bearer_only=true" \
  --data "config.scopes=openid" \
  --data "config.verify_parameters=false" \
  --data "config.anonymous=null" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Allow unauthenticated access to GET endpoints
echo "Creating route for GET product endpoints..."
curl -s -X POST http://kong:8001/routes \
  --data "name=public-products" \
  --data "methods[]=GET" \
  --data "paths[]=/api/v1/products" \
  --data "paths[]=/api/v1/products/search" \
  --data "paths[]=/api/v1/products/category" \
  --data "paths[]=/api/v1/products/available" \
  --data "service.id=$(curl -s http://kong:8001/services/product-service | jq -r '.id')" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Configure rate limiting
echo "Setting up rate limiting..."
curl -s -X POST http://kong:8001/services/product-service/plugins \
  --data "name=rate-limiting" \
  --data "config.minute=100" \
  --data "config.hour=1000" \
  --data "config.policy=local" \
  -H "Content-Type: application/x-www-form-urlencoded"

echo "Kong API Gateway configuration complete!"
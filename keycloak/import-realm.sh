#!/bin/bash

# Wait for Keycloak to be ready
echo "$(date '+%Y-%m-%d %H:%M:%S') Waiting for Keycloak to be ready..."
until curl -s --fail http://keycloak:8080 > /dev/null; do
  echo "$(date '+%Y-%m-%d %H:%M:%S') Keycloak not ready yet, waiting..."
  sleep 10
done

echo "$(date '+%Y-%m-%d %H:%M:%S') Keycloak is ready. Attempting to obtain admin token..."

# Login to Keycloak admin console with retry mechanism
MAX_RETRIES=5
RETRY_COUNT=0
KC_TOKEN=""

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ -z "$KC_TOKEN" ]; do
  KC_TOKEN=$(curl -s -X POST \
    "http://keycloak:8080/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=admin" \
    -d "password=admin" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//g' | sed 's/"//g')
  
  if [ -n "$KC_TOKEN" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') Successfully obtained admin token."
    break
  else
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo "$(date '+%Y-%m-%d %H:%M:%S') Failed to obtain admin token. Retry $RETRY_COUNT of $MAX_RETRIES..."
    sleep 5
  fi
done

if [ -z "$KC_TOKEN" ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') ERROR: Failed to obtain admin token after $MAX_RETRIES attempts."
  exit 1
fi

# Check if ecommerce realm already exists
echo "$(date '+%Y-%m-%d %H:%M:%S') Checking if ecommerce realm exists..."
REALM_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
  "http://keycloak:8080/admin/realms/ecommerce" \
  -H "Authorization: Bearer $KC_TOKEN")

if [ "$REALM_EXISTS" == "200" ] || [ "$REALM_EXISTS" == "404" ]; then
  if [ "$REALM_EXISTS" == "404" ]; then
    # Import the realm
    echo "$(date '+%Y-%m-%d %H:%M:%S') Importing ecommerce realm..."
    IMPORT_RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
      "http://keycloak:8080/admin/realms" \
      -H "Authorization: Bearer $KC_TOKEN" \
      -H "Content-Type: application/json" \
      --data-binary @/tmp/ecommerce-realm.json)
    
    if [ "$IMPORT_RESULT" == "201" ] || [ "$IMPORT_RESULT" == "409" ]; then
      echo "$(date '+%Y-%m-%d %H:%M:%S') Realm imported successfully!"
    else
      echo "$(date '+%Y-%m-%d %H:%M:%S') Failed to import realm. HTTP status: $IMPORT_RESULT"
      exit 1
    fi
  else
    echo "$(date '+%Y-%m-%d %H:%M:%S') Realm already exists, skipping import."
  fi
else
  echo "$(date '+%Y-%m-%d %H:%M:%S') Error checking realm existence. HTTP status: $REALM_EXISTS"
  exit 1
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') Keycloak setup completed successfully."
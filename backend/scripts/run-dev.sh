#!/usr/bin/env bash

# Go to backend root directory
cd "$(dirname "$0")/.." || exit 1

# Start Spring Boot first (non-blocking)
./gradlew bootRun &
SPRING_PID=$!

# Wait a few seconds for Spring Boot to start and expose the docs
echo "⏳ Waiting for Spring Boot to start..."
sleep 5  # optionally increase if your app starts slowly

# Download OpenAPI spec
curl -s http://localhost:8080/v3/api-docs -o openapi.json

# Start Scalar in the background
npx @scalar/cli reference openapi.json &
SCALAR_PID=$!

# Wait for Spring Boot to finish
wait $SPRING_PID

# Clean up Scalar after backend stops
kill $SCALAR_PID

#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci

echo "Building frontend..."
npm run build

echo "Build complete!"


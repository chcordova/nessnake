#!/bin/bash
set -e # The script will exit immediately if a command exits with a non-zero status.

echo "INFO: Starting setup script..."

# --- Global NPM Packages ---
echo "INFO: Installing global npm packages for the project..."
npm install -g typescript ts-node vite @capacitor/cli

echo "INFO: Setup script completed successfully."
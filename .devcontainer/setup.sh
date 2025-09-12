#!/bin/bash
set -e # The script will exit immediately if a command exits with a non-zero status.

echo "INFO: Starting setup script..."

# --- Google Cloud SDK Installation ---
echo "INFO: Installing Google Cloud SDK..."
apt-get update
apt-get install -y apt-transport-https ca-certificates curl gnupg git
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee /etc/apt/sources.list.d/google-cloud-sdk.list
apt-get update
apt-get install -y google-cloud-cli

# --- Global NPM Packages ---
echo "INFO: Installing global npm packages for the project..."
npm install -g typescript ts-node vite @capacitor/cli

# --- Update NPM to the latest version ---
echo "INFO: Updating npm to the latest version..."
npm install -g npm@latest

echo "INFO: Setup script completed successfully."
#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "INFO: Post-create script started."

# Fix permissions for the workspace and home folders.
echo "INFO: Ensuring correct folder ownership..."
sudo chown -R vscode:vscode /home/vscode /workspaces/nessnake

# Install npm dependencies from package.json.
echo "INFO: Installing npm dependencies..."
npm install

echo "INFO: Post-create script finished successfully."
echo "INFO: Container created. Dependencies installed and gcloud is authenticated!"
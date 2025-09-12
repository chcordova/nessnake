# Use the official Node.js v22 image from Microsoft (correct tag)
FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Update and install sudo, then create a non-root user 'vscode' with sudo access
RUN apt-get update && apt-get install -y sudo && \
    useradd -m -s /bin/bash vscode && \
    echo "vscode ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Copy the setup script into the container
COPY setup.sh /tmp/setup.sh

# Make the script executable and run it
RUN chmod +x /tmp/setup.sh && /tmp/setup.sh
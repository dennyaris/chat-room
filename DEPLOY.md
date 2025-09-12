# Deployment Guide

## Prerequisites

1. Node.js and pnpm installed on VPS
2. PM2 installed globally: `npm install -g pm2`
3. SSH access to VPS
4. Proper permissions on `/var/www/chat-room`

## Server Setup

1. Install Node.js and pnpm:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pnpm
   ```

2. Install PM2:
   ```bash
   sudo npm install -g pm2
   ```

3. Create deployment directory:
   ```bash
   sudo mkdir -p /var/www/chat-room
   sudo chown -R $USER:$USER /var/www/chat-room
   ```

## Local Setup

1. Update Makefile configuration:
   - Set `SERVER_USER` to your VPS username
   - Set `SERVER_HOST` to your VPS IP/domain
   - Verify `SERVER_PATH` matches your deployment directory

## Deployment Steps

1. Build and deploy:
   ```bash
   make deploy
   ```
   This will:
   - Install dependencies
   - Build the application
   - Package the build into a tarball
   - Upload to VPS
   - Extract and start/restart PM2 process

2. Verify deployment:
   ```bash
   # On VPS
   pm2 status
   pm2 logs chat-room
   ```

## Maintenance

- View logs: `pm2 logs chat-room`
- Restart app: `pm2 restart chat-room`
- Stop app: `pm2 stop chat-room`
- Remove app: `pm2 delete chat-room`

## Troubleshooting

1. If deployment fails:
   - Check SSH connection
   - Verify directory permissions
   - Check PM2 logs: `pm2 logs chat-room`

2. If app doesn't start:
   - Verify Node.js and pnpm are installed
   - Check port availability (default: 4173)
   - Review PM2 logs

3. For permission issues:
   ```bash
   sudo chown -R $USER:$USER /var/www/chat-room
   chmod -R 755 /var/www/chat-room
   ```
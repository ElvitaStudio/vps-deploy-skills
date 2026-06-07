#!/bin/bash
# deploy.sh — run on the SERVER after uploading files via SFTP
# Usage: bash deploy.sh [frontend|backend|both]
# Example: bash deploy.sh both

set -e

PROJECT_ROOT="/root/myproject"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_PM2_NAME="myapp-frontend"
BACKEND_PM2_NAME="myapp-backend"

TARGET=${1:-"both"}

echo "🚀 Deploy started: $TARGET"

deploy_frontend() {
    echo "📦 Building frontend..."
    cd "$FRONTEND_DIR"
    npm install
    npm run build
    echo "🔄 Restarting frontend PM2 process..."
    pm2 restart "$FRONTEND_PM2_NAME"
    echo "✅ Frontend deployed"
}

deploy_backend() {
    echo "🐍 Updating backend dependencies..."
    cd "$BACKEND_DIR"
    .venv/bin/pip install -r requirements.txt -q
    echo "🔄 Restarting backend PM2 process..."
    pm2 restart "$BACKEND_PM2_NAME"
    echo "✅ Backend deployed"
}

case "$TARGET" in
    frontend)
        deploy_frontend
        ;;
    backend)
        deploy_backend
        ;;
    both)
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo "Usage: bash deploy.sh [frontend|backend|both]"
        exit 1
        ;;
esac

echo ""
echo "📊 PM2 status:"
pm2 list

echo ""
echo "🎉 Deploy complete"

#!/bin/bash
# ==============================================================================
# Wai Municipal Council — Ultra-Fast PM2 & Nginx Production Update Script
# Usage: ./deploy/update.sh (Takes ~20-25 seconds)
# ==============================================================================
set -e

echo "=========================================="
echo "  🚀 Updating Wai Municipal Council Live   "
echo "=========================================="

# Ensure we are in project root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "📥 1. Pulling latest changes from GitHub..."
git pull origin main

echo "⚡ 2. Building Packages & Frontends..."
export VITE_API_URL="/api"
npm --prefix packages/types run build
npm run build:web
npm run build:admin
npm run build:employee

echo "⚡ 3. Building NestJS API..."
npm --prefix apps/api run build

echo "🔄 4. Restarting API via PM2 (0.2s)..."
pm2 restart wmc-api

echo "🔄 5. Reloading Nginx..."
sudo systemctl reload nginx

echo "=========================================="
echo "✅ All Updated & Live in ~25 seconds!"
echo "=========================================="

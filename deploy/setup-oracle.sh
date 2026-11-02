#!/usr/bin/env bash
# ==============================================================================
# Wai Municipal Council — 1-Click Oracle Cloud Ubuntu VM Setup Script
# ==============================================================================
set -e

echo "========================================================"
echo "  Setting up Wai Municipal Council on Oracle Cloud VM   "
echo "========================================================"

# 1. Update Ubuntu system packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw apt-transport-https ca-certificates gnupg lsb-release

# 2. Configure Host Firewall (Open HTTP 80, HTTPS 443, SSH 22)
echo "🔒 Configuring Host Firewall rules..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || true

# 3. Install Docker Engine and Docker Compose
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm -f get-docker.sh
fi

# 4. Clone or update repository in /opt/nagari-seva-setu
TARGET_DIR="/opt/nagari-seva-setu"
if [ ! -d "$TARGET_DIR" ]; then
    echo "📦 Cloning repository into $TARGET_DIR..."
    sudo mkdir -p "$TARGET_DIR"
    sudo chown -R $USER:$USER "$TARGET_DIR"
    git clone https://github.com/PAVAN2627/waimnc.git "$TARGET_DIR"
fi

cd "$TARGET_DIR"
mkdir -p deploy/certbot/www deploy/certbot/conf

echo "========================================================"
echo "✅ Oracle Cloud VM is ready!"
echo "Next step: Run 'docker compose -f docker-compose.prod.yml up -d --build'"
echo "========================================================"

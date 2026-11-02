FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy pre-built application and dependencies
COPY package*.json ./
COPY packages/types ./packages/types
COPY apps/api ./apps/api
COPY node_modules ./node_modules

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/main"]

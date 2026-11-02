# Stage 1: Build packages and API
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat openssl

# Copy package manifests
COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/types ./packages/types
COPY apps/api ./apps/api

# Build types package first
RUN npm --prefix packages/types run build

# Generate Prisma Client & Build NestJS API
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Copy built artifacts and dependencies
COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY apps/api/package*.json ./apps/api/

RUN npm ci --omit=dev

COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/main"]


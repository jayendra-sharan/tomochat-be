# Stage 1 - Build
FROM node:18-alpine AS builder

ENV CACHE_BUST=1

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript (allow emit even with errors)
RUN npm run build:prod

# Stage 2 - Production
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma Client (does not need real DATABASE_URL)
RUN npx prisma generate

EXPOSE 3001

# Run migrations at runtime (with real DATABASE_URL from EB env vars) and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

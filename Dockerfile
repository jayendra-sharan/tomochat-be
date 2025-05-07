# Stage 1 - Build
FROM node:18-alpine AS builder

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

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3001

# Run app → NOTE: we fixed the CMD to dist/index.js
CMD ["node", "dist/server.js"]

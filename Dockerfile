# ---- Base image ----
FROM node:20-slim

# ---- Set working directory ----
WORKDIR /app

# ---- Copy package files and install dependencies ----
COPY package*.json ./
RUN npm ci

# ---- Copy source files ----
COPY . .

# ---- Build the app ----
RUN npm run build:prod

# ---- Expose and run ----
EXPOSE 8080
CMD ["sh", "-c", "npx prisma generate && node dist/index.js"]

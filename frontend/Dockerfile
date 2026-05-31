FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

COPY . .
RUN npm run build

# Produktions-Stage mit leichtem HTTP-Server
FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g serve@14

COPY --from=builder /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
    CMD wget -q --spider http://localhost:3000 || exit 1

CMD ["serve", "-s", "dist", "-l", "3000"]

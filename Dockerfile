# ── Stage 1: Build ────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install deps first (layer cache)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bun run build

# ── Stage 2: Serve ────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Coolify uses the first EXPOSE port for Traefik routing
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

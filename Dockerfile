# ── Stage 1: Build ────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Production ──────────────────────────────────────
FROM nginx:1.27-alpine AS production

# OCI metadata
LABEL org.opencontainers.image.title="jakubsladek.cz"
LABEL org.opencontainers.image.description="Portfolio website for Jakub Sládek"
LABEL org.opencontainers.image.url="https://jakubsladek.cz"

# Remove default nginx config and html
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Healthcheck for Coolify container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

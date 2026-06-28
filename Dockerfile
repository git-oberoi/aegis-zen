# --- Stage 1: Build the Frontend ---
FROM node:20-alpine AS builder

WORKDIR /app/frontend

# Copy frontend dependency manifests
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build production client assets
RUN npm run build

# --- Stage 2: Build the Backend & Runner ---
FROM node:20-alpine

WORKDIR /app

# Copy backend dependency manifests
COPY backend/package*.json ./backend/

# Install only backend production dependencies
RUN npm ci --prefix backend --only=production

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets from the builder stage
COPY --from=builder /app/frontend/dist ./frontend/dist

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Cloud Run injects the PORT environment variable. We expose 8080 as standard.
EXPOSE 8080

# Start the unified server
CMD ["node", "backend/server.js"]

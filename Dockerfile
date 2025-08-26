# Dockerfile (use the Puppeteer base image to avoid manual apt pain)
FROM ghcr.io/puppeteer/puppeteer:22.13.1

WORKDIR /app/backend

# Copy backend package files and install (use cached layers)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY backend ./

EXPOSE 8000
CMD ["node", "api/index.js"]

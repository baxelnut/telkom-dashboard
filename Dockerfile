FROM node:20-slim

# Don’t auto-download Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROMIUM_PATH=/usr/bin/chromium

# Install Chromium + dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    chromium-common \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxshmfence1 \
    libegl1 \
    libxss1 \
    wget \
    ca-certificates \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Set backend as working directory
WORKDIR /app/backend

# Copy only backend package files first for caching
COPY backend/package*.json ./

RUN npm ci --omit=dev

# Copy backend source
COPY backend ./

EXPOSE 8000
CMD ["node", "api/index.js"]
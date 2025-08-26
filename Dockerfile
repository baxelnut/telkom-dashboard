FROM node:20-slim

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROMIUM_PATH=/usr/bin/chromium

# Install Chromium and required libs
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

# quick verification in build logs
RUN ${CHROMIUM_PATH} --version || echo "Chromium not found"

# Use backend folder for install & runtime
WORKDIR /app/backend

# copy backend package files and install only backend deps
COPY backend/package*.json ./
RUN npm ci --omit=dev

# copy backend code
COPY backend ./

EXPOSE 8000
CMD ["node", "api/index.js"]

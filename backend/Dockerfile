FROM node:20-slim

# prevent puppeteer from attempting to download chromium at npm install
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH=/usr/bin/chromium

# Install Chromium + deps
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
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
    wget \
    ca-certificates \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Work from inside backend
WORKDIR /app

# Copy only backend package.json
COPY package*.json ./

# install backend deps only (no dev)
RUN npm ci --omit=dev

# Copy backend code
COPY . .

EXPOSE 8000
CMD ["node", "index.js"]

# Dockerfile - use Debian slim, install chromium and runtimes
FROM node:20-bullseye-slim

# install chrome deps + chromium (and dbus uuid generator)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libgtk-3-0 \
    libxss1 \
    libasound2 \
    libnss3 \
    libx11-xcb1 \
    dbus \
    dbus-user-session \
    chromium \
    gnupg \
    && dbus-uuidgen --ensure=/etc/machine-id \
    && rm -rf /var/lib/apt/lists/*

# point to the chromium binary
ENV CHROMIUM_PATH=/usr/bin/chromium
# tell puppeteer not to try download Chromium (we use system one)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app/backend

# Copy package.json & install
COPY backend/package*.json ./
# install dependencies (should include puppeteer or puppeteer-core in package.json)
RUN npm ci --omit=dev

# Copy source
COPY backend ./

EXPOSE 8000
CMD ["node", "api/index.js"]

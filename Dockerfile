FROM ghcr.io/puppeteer/puppeteer:22.13.1

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend ./

EXPOSE 8000
CMD ["node", "api/index.js"]

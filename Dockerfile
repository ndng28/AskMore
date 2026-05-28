FROM node:22-alpine
WORKDIR /app

RUN mkdir -p /app/data && chown node:node /app/data

COPY package*.json ./
RUN npm ci --only=production

COPY server.js game.js en.js index.html ./

ENV DATA_DIR=/app/data

EXPOSE 3000
USER node
CMD ["node", "server.js"]

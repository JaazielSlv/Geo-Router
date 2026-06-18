FROM node:20-bullseye-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y openssl libssl1.1 iputils-ping && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install && npx prisma generate

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]

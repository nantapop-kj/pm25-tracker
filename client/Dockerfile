FROM node:26-alpine

WORKDIR /app

COPY client/package*.json ./

RUN npm ci

EXPOSE 3000

CMD ["sleep", "infinity"]
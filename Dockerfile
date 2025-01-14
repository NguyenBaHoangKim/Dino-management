FROM node:20.15

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY openapi.yaml ./app/openapi.yaml

EXPOSE 8000
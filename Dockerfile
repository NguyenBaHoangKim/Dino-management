FROM node:20.15 AS base-dev

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

FROM base-dev AS development

CMD ["node", "--env-file=.env.development", "--watch", "bin/www.js"]

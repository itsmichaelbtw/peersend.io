FROM node:20-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./

FROM base AS development

WORKDIR /usr/src/app

COPY . .

ENV NODE_ENV=development

RUN npm install

CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0"]

FROM base AS production

WORKDIR /usr/src/app

COPY web/ ./

ENV NODE_ENV=production

RUN npm install
RUN npm run build

FROM nginx:stable-alpine AS deployment

COPY --from=production /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

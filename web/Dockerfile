FROM node:20-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

FROM base AS development

WORKDIR /usr/src/app

COPY . .

ENV NODE_ENV=development

CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0"]

FROM base AS production

WORKDIR /usr/src/app

COPY web/ ./

ENV NODE_ENV=production

RUN npm run build

FROM nginx:stable-alpine AS deployment

COPY --from=production /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

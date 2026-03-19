FROM node:20-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

FROM base AS development

COPY . .

ENV NODE_ENV=development

EXPOSE 5173

CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0"]

FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_SITE_URL
ARG VITE_TELEGRAM_BOT_ID
ENV VITE_SITE_URL=$VITE_SITE_URL \
    VITE_TELEGRAM_BOT_ID=$VITE_TELEGRAM_BOT_ID

RUN npm run build

FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv/app

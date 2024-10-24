FROM hub.lumigame.com/base/node:20.9.0-alpine-24h1.1 AS base
FROM base AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat
ENV YARN_CACHE_FOLDER=/root/.yarn

RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn cache dir && yarn cache list

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn install --frozen-lockfile --verbose

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json yarn.lock tsconfig.json configs.json game-settings.json .babelrc webpack.config.js ./
COPY configs ./configs
COPY public ./public
COPY src ./src

RUN yarn build

FROM hub.lumigame.com/base/nginx:brotli-1.20.2-zlib AS publish
COPY ./src/.nginx/game.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html/

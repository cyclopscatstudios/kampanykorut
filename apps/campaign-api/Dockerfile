FROM node:24-alpine AS base
WORKDIR /app
ENV HUSKY=0 \
    MONGOMS_DISABLE_POSTINSTALL=1

FROM base AS builder

COPY package.json yarn.lock ./
COPY apps/campaign-api/package.json apps/campaign-api/
RUN yarn install --frozen-lockfile

COPY shared ./shared
COPY apps/campaign-api ./apps/campaign-api
RUN yarn workspace campaign-api build

FROM base AS deps

COPY yarn.lock ./
COPY apps/campaign-api/package.json ./
RUN yarn install --production --frozen-lockfile && yarn cache clean

FROM base AS runner

ARG APP_VERSION=dev
ARG GIT_COMMIT=unknown
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4000 \
    TRUST_PROXY=1 \
    APP_VERSION=$APP_VERSION \
    GIT_COMMIT=$GIT_COMMIT

COPY --from=deps /app/node_modules ./node_modules
COPY apps/campaign-api/package.json ./
COPY --from=builder /app/apps/campaign-api/dist ./dist

RUN mkdir -p /app/data/assets && chown -R node:node /app/data

USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" > /dev/null || exit 1

CMD ["node", "--enable-source-maps", "dist/server.js"]

FROM node:22-alpine AS builder

WORKDIR /app

COPY . .
RUN yarn install --frozen-lockfile

ARG VITE_SENTRY_DSN
ARG VITE_POSTHOG_KEY
ARG VITE_POSTHOG_HOST
ARG VITE_TURNSTILE_SITE_KEY
ARG VITE_ENVIRONMENT=production
ARG GIT_COMMIT=unknown

ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY
ENV VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV GIT_COMMIT=$GIT_COMMIT

RUN yarn workspace kampanykorut build
RUN yarn workspace campaign-maker build

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/kampanykorut/dist /usr/share/nginx/html
COPY --from=builder /app/apps/campaign-maker/dist /usr/share/nginx/html/maker

ENV API_UPSTREAM=http://campaign-api:4000 \
    NGINX_RESOLVER=127.0.0.11

COPY apps/kampanykorut/nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM node:22-alpine AS builder

WORKDIR /app

COPY . .
RUN yarn install --frozen-lockfile

ARG VITE_SENTRY_DSN
ARG VITE_POSTHOG_KEY
ARG VITE_POSTHOG_HOST
ARG GIT_COMMIT=unknown

ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY
ENV VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST
ENV GIT_COMMIT=$GIT_COMMIT

RUN yarn workspace kampanykorut build

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/kampanykorut/dist /usr/share/nginx/html

COPY apps/kampanykorut/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

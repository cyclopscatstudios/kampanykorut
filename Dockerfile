FROM node:22-alpine AS builder

WORKDIR /app

COPY . .
RUN yarn install --frozen-lockfile

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG GIT_COMMIT=unknown
ENV GIT_COMMIT=$GIT_COMMIT

RUN yarn workspace kampanykorut build

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/kampanykorut/dist /usr/share/nginx/html

COPY apps/kampanykorut/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

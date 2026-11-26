FROM node:22-alpine AS build
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_HEALTH_URL=/actuator/health
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_HEALTH_URL=${VITE_HEALTH_URL}
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31-alpine AS runtime
USER root
RUN apk del nginx-module-geoip nginx-module-image-filter nginx-module-njs nginx-module-xslt curl \
    && apk add --no-cache --upgrade nginx \
    && apk upgrade --no-cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=6 CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1

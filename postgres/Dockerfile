FROM postgres:19-alpine
RUN apk upgrade --no-cache && rm /usr/local/bin/gosu
USER postgres
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=20 CMD pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" || exit 1

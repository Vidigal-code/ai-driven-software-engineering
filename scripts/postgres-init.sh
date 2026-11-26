#!/bin/sh
set -eu

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set ON_ERROR_STOP=1 \
  --set app_user="$APP_DB_USER" --set app_password="$APP_DB_PASSWORD" --set app_database="$APP_DB_NAME" <<'SQL'
CREATE ROLE :"app_user" WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD :'app_password';
CREATE DATABASE :"app_database" OWNER :"app_user";
REVOKE ALL ON DATABASE :"app_database" FROM PUBLIC;
SQL

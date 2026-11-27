import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const email = args.length === 2 && args[0] === '--admin-email' ? args[1] : '';
if (args.length > 0 && !email) {
  throw new Error('Usage: node scripts/init-env.mjs [--admin-email your-address@example.com]');
}
if (email && !/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(email)) {
  throw new Error('Provide a valid administrator email address.');
}

const entries = {
  FRONTEND_PORT: '3000',
  BACKEND_PORT: '8080',
  POSTGRES_PORT: '5432',
  VITE_API_BASE_URL: '/api/v1',
  VITE_HEALTH_URL: '/actuator/health',
  POSTGRES_PASSWORD: randomBytes(32).toString('base64url'),
  APP_DB_NAME: 'library',
  APP_DB_USER: 'library_app',
  APP_DB_PASSWORD: randomBytes(32).toString('base64url'),
  DB_POOL_SIZE: '10',
  MAX_PAGE_SIZE: '100',
  RECENT_BOOKS_LIMIT: '5',
  AUTH_MAX_ATTEMPTS: '30',
  AUTH_RATE_WINDOW: 'PT1M',
  AUTH_RATE_CAPACITY: '10000',
  JWT_SECRET: randomBytes(48).toString('base64'),
  JWT_ISSUER: 'library-api',
  JWT_AUDIENCE: 'library-web',
  ACCESS_TOKEN_TTL: 'PT15M',
  REFRESH_TOKEN_TTL: 'P7D',
  CORS_ALLOWED_ORIGINS: 'http://localhost:3000,http://localhost:8080',
  COOKIE_SECURE: 'false',
  OPENAPI_ENABLED: 'true',
  BOOTSTRAP_ADMIN_ENABLED: String(Boolean(email)),
  BOOTSTRAP_ADMIN_EMAIL: email,
  BOOTSTRAP_ADMIN_PASSWORD: email ? randomBytes(24).toString('base64url') : '',
  BOOTSTRAP_ADMIN_NAME: 'Library Administrator',
  DEMO_DATA_ENABLED: 'false',
  SPRING_PROFILES_ACTIVE: '',
};

const destination = resolve('.env');
const content = Object.entries(entries).map(([key, value]) => `${key}=${value}`).join('\n');
writeFileSync(destination, `${content}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
console.log('Created .env with random local secrets. Keep this file private and out of version control.');
console.log(email ? 'Administrator bootstrap explicitly enabled. Read its credentials from your local .env.' : 'Administrator bootstrap is disabled.');

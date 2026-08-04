import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { defineNitroConfig } from 'nitropack';

if (existsSync('.env.local')) {
  loadEnvFile('.env.local');
}

export default defineNitroConfig({
  srcDir: 'server',
  routeRules: {
    '/api/**': { cors: true },
  },
});
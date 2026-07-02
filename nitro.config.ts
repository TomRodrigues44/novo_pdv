import { defineNitroConfig } from 'nitropack';

export default defineNitroConfig({
  srcDir: 'server',
  routeRules: {
    '/api/**': { cors: true },
  },
});
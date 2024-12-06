import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1730445296613_8790',
  koa: {
    port: 7001,
  },
  cors: {
    origin: 'http://localhost:8000',
    credentials: true,
    allowMethods: ['GET', 'POST'],
  },
} as MidwayConfig;

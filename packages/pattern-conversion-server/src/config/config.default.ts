import { uploadWhiteList } from '@midwayjs/busboy';
import { MidwayConfig } from '@midwayjs/core';
import { tmpdir } from 'os';
import * as path from 'path';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1730445296613_8790',
  koa: {
    port: 7001,
  },
  cors: {
    origin: 'http://localhost:8000',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  
  // origin: (ctx) => {
  //   const allowedOrigins = ['http://localhost:8000', 'http://10.5.33.192:8000'];
  //   if (allowedOrigins.includes(ctx.request.header.origin)) {
  //     return true
  //   }
  //   return false; // 不允许跨域
  // },
  // credentials: true,
  // allowMethods: ['GET', 'POST'],
  },
  jwt: {
    secret: 'lihang.wang', // fs.readFileSync('xxxxx.key')
    sign: {
      // signOptions
      expiresIn: '1000h',
    },
  },
  sequelize: {
    dataSource: {
      default:{
        database: 'pattern-conversion',
        username: 'lihang',
        password: '123456',
        host: 'localhost',
        port: '5432',
        encrypt: false,
        dialect: 'postgres',
        define: {
          charset: 'utf-8',
          timestamps: true,
        },
        timezone: '+08:00',
        sync: {                         // 自动同步表结构
          force: false,                 // 强制同步（删除现有表）
          alter: false,                  // 根据模型自动调整表结构
        },
        entities: [
          './entity/postgre'
        ],
        logging: console.log,  
      }
    }
  },
  busboy: {
    mode: 'file',
    whitelist: [uploadWhiteList, '.xlsx'],
    tmpdir: path.join(tmpdir(), 'midway-upload-files'),
    cleanTimeout: 1000 * 60 * 1000,
    fileSize: '50mb'
  },
} as MidwayConfig;

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
  jwt: {
    secret: 'lihang.wang', // fs.readFileSync('xxxxx.key')
    sign: {
      // signOptions
      expiresIn: '10h',
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
        sync: false,
        entities: [
          './entity/postgre'
        ],
        logging: console.log,  
      }
    }
  }
} as MidwayConfig;

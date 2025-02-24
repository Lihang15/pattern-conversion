import { defineConfig } from '@umijs/max';
import proxy from './proxy';
import routes from './routes'
export default defineConfig({
  locale:{
      default: 'en-Us',
      antd: true,
      baseNavigator: false,
  },
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {

  },
  proxy: proxy['dev'],
  routes,
  favicons: ['/logo/favicon.ico'],
   
  npmClient: 'pnpm',
  define:{
    'process.env.API_ENV': process.env.API_ENV
  }
});


import { defineConfig } from '@umijs/max';
import proxy from './proxy';
import routes from './routes'
export default defineConfig({
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
});


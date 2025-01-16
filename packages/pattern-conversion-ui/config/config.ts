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
    title: 'Accotest',
  },
  proxy: proxy['dev'],
  routes,
   
  npmClient: 'pnpm',
});


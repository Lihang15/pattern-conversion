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
  favicons: ['https://img1.baidu.com/it/u=2683154888,3741468738&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500'],
   
  npmClient: 'pnpm',
});


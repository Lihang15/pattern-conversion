export default {
    dev: {
      '/api/': {
        target: 'http://localhost:7001',
        changeOrigin: true,
        ws: true,  // 允许 WebSocket 协议的支持
        secure: false, // 不验证 SSL
        pathRewrite: { '^': '' },
        // onProxyReq: (proxyReq) => {
        //   // 禁用代理缓存
        //   proxyReq.setHeader('Cache-Control', 'no-cache');
        //   proxyReq.setHeader('Connection', 'keep-alive');
        // },
      },
    },
  };
  
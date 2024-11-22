export default {
    dev: {
      '/api/': {
        target: 'http://localhost:7001',
        changeOrigin: true,
        pathRewrite: { '^': '' },
      },
    },
  };
  
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://backend:8080',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
  
  // Proxy para uploads/imagens
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://backend:8080',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};
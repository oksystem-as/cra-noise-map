var proxy = require('http-proxy-middleware');

var options = {
        target: 'https://api.pripoj.me',  // new target host
        changeOrigin: true,               // needed for virtual hosted sites
        ws: true,                         // proxy websockets
        pathRewrite: {
            '^/api' : '/',     // rewrite path - /api je tu jen kvuli identifikaci 
        },
    };

var apiProxy = proxy("/api", options);

module.exports = {
    server: {
        middleware: {
            1: apiProxy
        }
    }
};
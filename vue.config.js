const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
      ? '/OliverMath/'
      : '/',
    configureWebpack: config => {
      if (process.env.NODE_ENV === 'production') {
        config.plugins.push(
          new GenerateSW({
            swDest: 'service-worker.js',
            skipWaiting: true,
            clientsClaim: true,
            navigateFallback: '/OliverMath/index.html',
            navigateFallbackAllowlist: [/^(?!\/__)/],
            runtimeCaching: [
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images',
                  expiration: {
                    maxEntries: 60,
                    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                  }
                }
              },
              {
                urlPattern: /\.(?:js|css)$/,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'static-resources'
                }
              },
              {
                urlPattern: /\.(?:mp3|wav|ogg)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'audio',
                  expiration: {
                    maxEntries: 30,
                    maxAgeSeconds: 30 * 24 * 60 * 60
                  }
                }
              },
              {
                urlPattern: /^https:\/\/olivermath-api\.azurewebsites\.net\/api\//,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  networkTimeoutSeconds: 10,
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60 // 5 minutes
                  }
                }
              }
            ]
          })
        );
      }
    }
  }
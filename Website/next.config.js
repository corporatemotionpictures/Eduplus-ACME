const path = require('path')
require('dotenv').config({ path: 'path/to/.env' })

module.exports = {
  webpack5:false,
  // Used for module import rather than absolute path import
  webpack(config, options) {
    config.resolve.alias['components'] = path.join(__dirname, 'components');
    config.resolve.alias['db'] = path.join(__dirname, 'database');
    config.resolve.alias['layouts'] = path.join(__dirname, 'layouts');
    config.resolve.alias['helpers'] = path.join(__dirname, 'helpers');
    config.resolve.alias['uploads'] = path.join(__dirname, 'uploads');
    config.resolve.alias['hooks'] = path.join(__dirname, 'hooks');
    config.resolve.alias['public'] = path.join(__dirname, 'public');
    config.resolve.alias['pages'] = path.join(__dirname, 'pages');
    config.resolve.alias['src'] = path.join(__dirname, 'src');
    config.node = { fs: 'empty' }
    return config;
  },

  async headers() {
    return [
      {
        source: '/dashboard/live-events/zoom/:meetingID',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy', value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy', value: 'same-origin',
          },
        ],
      },
      {
        source: '/web-app/dashboard/:productslug/live-events/:slug',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy', value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy', value: 'same-origin',
          },
        ],
      },
      {
        source: '/desktop-app/dashboard/:productslug/live-events/:slug',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy', value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy', value: 'same-origin',
          },
        ],
      },
      {
        source: '/web-app/dashboard/webinars/:slug',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy', value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy', value: 'same-origin',
          },
        ],
      },
      {
        source: '/desktop-app/dashboard/webinars/:slug',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy', value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy', value: 'same-origin',
          },
        ],
      },
      {
        source: '/webinars/:slug',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy', value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy', value: 'same-origin',
          },
        ],
      },
    ]
  },
  
}
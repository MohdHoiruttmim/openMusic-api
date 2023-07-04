const path = require('path');

const routes = () => [
  {
    method: 'GET',
    path: '/covers/{params*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file'),
      },
    },
  },
];

module.exports = routes;

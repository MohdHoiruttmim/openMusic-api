const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { ExportsService, validator }) => {
    const exportsHandler = new ExportsHandler(ExportsService, validator);
    server.route(routes(exportsHandler));
  },
};

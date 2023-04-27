const CollaborationsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { collaborationsService, usersService, playlistService, validator }) => {
    const collaborationsHandler = new CollaborationsHandler(collaborationsService, usersService, playlistService, validator);
    server.route(routes(collaborationsHandler));
  },
}
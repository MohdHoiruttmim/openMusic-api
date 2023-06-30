const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(ExportsService, validator) {
    this._exportsService = ExportsService;
    this._validator = validator;

    console.log(ExportsService)
    console.log(validator)

    autoBind(this);
  }

  async sendEmailHandler(request, h) {
    const { playlistId } = request.params;

    console.log(playlistId);
    return request.params;
  }
}

module.exports = ExportsHandler;

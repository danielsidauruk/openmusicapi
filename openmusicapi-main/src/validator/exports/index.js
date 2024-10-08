const { ExportPlaylistsPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ExportPlaylistsValidator = {
  validateExportPlaylistsPayload: (payload) => {
    const validateResult = ExportPlaylistsPayloadSchema.validate(payload);

    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = ExportPlaylistsValidator;

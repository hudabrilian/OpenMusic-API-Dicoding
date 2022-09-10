const InvariantError = require("../../exceptions/InvariantError");
const AlbumPayloadSchema = require("./schema");

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.errors) {
      throw new InvariantError(validationResult.errors.message);
    }
  },
};

module.exports = AlbumValidator;

const { ExpressFileuploadValidator } = require('express-fileupload-validator');
const { FileTypeError } = require('../utils/errors');

const fileValid = new ExpressFileuploadValidator({
  minCount: 1,
  maxCount: 1,
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  allowedMimetypes: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: '15MB',
});

module.exports = async (req, res, next) => {
  if (!req.files || !req.files.image) {
    // Si pas de fichier image (lors de la mise à jour d'un book sans fichier)
    return next();
  }

  try {
    await fileValid.validate(req.files.image); 
    next();
  } catch (error) {
    next(new FileTypeError(error.message));
  }
};
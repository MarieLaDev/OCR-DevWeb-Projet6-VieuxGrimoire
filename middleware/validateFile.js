const { ExpressFileuploadValidator } = require('express-fileupload-validator');

const fileValid = new ExpressFileuploadValidator({
  minCount: 1,
  maxCount: 1,
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'],
  allowedMimetypes: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: '5MB',
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
    const customErrorMessage = "Le fichier doit avoir une extension jpg/jpeg/png/gif ou webp et faire moins de 5Mo";
    
    next(res.status(400).json({ message: customErrorMessage}));
  }
};
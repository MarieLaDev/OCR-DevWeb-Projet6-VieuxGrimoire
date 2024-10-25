const sharp = require('sharp');
require('dotenv').config();

const compressImage = (reqFile) => {
  // originalName => Nom du fichier sans extension
  const originalName = reqFile.name.split('.')[0]; 
  const timestamp = Date.now(); 
  const newFileName = `${originalName}${timestamp}.webp`; 
  const outputPath = process.env.IMG_PATH + newFileName; 

  return sharp(reqFile.data)
    .resize({ width: 450 })
    .toFormat('webp', { quality: 80 }) 
    .toFile(outputPath)
    .then(() => {
      return { outputPath };
    })
    .catch(error => {
      throw error;
    });
};

module.exports =  compressImage;
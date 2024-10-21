const sharp = require('sharp');

const compressImage = (reqFile) => {
  // originalName => Nom du fichier sans extension
  const originalName = reqFile.name.split('.')[0]; 
  const timestamp = Date.now(); 
  const newFileName = `${originalName}${timestamp}.webp`; 
  const outputPath = `images/${newFileName}`; 

  return sharp(reqFile.data)
    .resize({ width: 500 })
    .toFormat('webp', { quality: 80 }) 
    .toFile(outputPath)
    .then(() => {
      console.log(`Image compressée et sauvegardée sous ${outputPath}`);
      return { outputPath };
    })
    .catch(err => {
      console.error("Erreur lors de la compression de l'image:", err);
      throw err;
    });
};

module.exports =  compressImage;
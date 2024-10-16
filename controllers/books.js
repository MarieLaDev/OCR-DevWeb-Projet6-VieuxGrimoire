const sharp = require('sharp');
const Book = require('../models/books');
const fs = require('fs');

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
    });
};

exports.createBook = (req, res, next) =>{  
  console.log(req.files); 
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: "Non autorisé" });
  }
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  compressImage(req.files.image)
    .then(({ outputPath }) => {
      const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/${outputPath}`
      });

      return book.save()
    })  
    .then(() => {res.status(201).json({ message: "Livre enregistré ! "})})
    .catch(error => res.status(400).json({error}))
}

exports.modifyBook = (req, res, next) => {
  console.log("Corps de la requête:", req.body);
  console.log("req.files :", req.files);

  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  const bookObject = JSON.parse(req.body.book);
  
  if (req.files && req.files.image) {
    Book.findOne({_id: req.params.id})
    .then(book => {
      const filename = book.imageUrl.split('/images/')[1];
      
      console.log(filename);

      // Supprimer l'ancienne image
      fs.unlink(`images/${filename}`, (err) => {
        if (err) {
          console.error(`Erreur lors de la suppression de l'ancienne image : ${err}`);
        }
      });
    })
    .catch(error => res.status(500).json({error}));
    compressImage(req.files.image)
      .then(({ outputPath }) => {
        if (!outputPath) {
          throw new Error("Le chemin de l'image compressée est introuvable.");
        }

        // Log pour vérifier les valeurs envoyées à MongoDB
        const updatedBookData = {
          ...bookObject,
          _id: req.params.id,
          imageUrl: `${req.protocol}://${req.get('host')}/${outputPath}`
        };
        
        console.log("Données mises à jour du livre : ", updatedBookData);
        
        return Book.updateOne(
          { _id: req.params.id },
          updatedBookData
        );
      })
      .then(() => {
        console.log("Mise à jour du livre réussie avec la nouvelle URL de l'image");
        res.status(201).json({ message: "Livre modifié avec succès !" });
      })
      .catch(error => {
        console.error("Erreur lors de la mise à jour du livre avec la nouvelle image :", error);
        res.status(400).json({ error });
      });
  } else {
    // Si aucune nouvelle image n'est fournie
    Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id }
    )
      .then(() => {
        console.log("Livre mis à jour sans nouvelle image.");
        res.status(201).json({ message: "Livre modifié sans nouvelle image !" });
      })
      .catch(error => {
        console.error("Erreur lors de la mise à jour sans image :", error);
        res.status(400).json({ error });
      });
  }
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
    .then(book => {
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({_id: req.params.id})
          .then(() => {res.status(200).json({message: "Livre supprimé !"})})
          .catch(error => res.status(401).json({error}));
      });
    })
    .catch(error => res.status(500).json({error}));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({error}));
}

exports.getOneBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({error}));
}

exports.getBestRatingBooks = (req, res, next) => {
  Book.find()
    .then(books => {
      if (books.length < 3) {
        return res.status(200).json(books);
      }
      const tri = books.sort((a, b) => {
        return (b.averageRating - a.averageRating);
      });
      return res.status(200).json(tri.slice(0, 3));
    })
    .catch(error => res.status(400).json(error));
}

exports.createRating = (req, res, next) => {
  const { userId, rating } = req.body;
  
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification si l'utilisateur a déjà noté ce livre
      const existingRating = book.ratings.find(rate => rate.userId === userId);

      // Indiquer la note donnée ou ajouter la note
      existingRating 
        ? existingRating.grade = rating 
        : book.ratings.push({ userId, grade: rating });

      // Calcul de la nouvelle moyenne
      const totalRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
      book.averageRating = totalRatings / book.ratings.length;

      // Sauvegarde des modifications
      return book.save();
    })
    .then((updatedBook) => res.status(201).json(updatedBook))
    .catch(error => res.status(400).json({ error }));
};
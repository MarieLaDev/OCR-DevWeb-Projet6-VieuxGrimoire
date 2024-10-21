
const Book = require('../models/books');
const fs = require('fs');
const compressImage = require('../middleware/compressImage');

exports.createBook = (req, res, next) => {  
  console.log('Corps de la requête pour créer un livre:', req.body);
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: "Non autorisé" });
  }
  
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  // Vérifie que le fichier est bien reçu
  if (!req.files || !req.files.image) {
    console.log("Pb de fichier");
    return res.status(400).json({ message: "Image manquante ou non valide." });
  }

  console.log("fichier reçu : " + req.files.image);

  compressImage(req.files.image)
    .then(({ outputPath }) => {
      console.log(outputPath);

      const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/${outputPath}`
      });

    return book.save()
    })  
    .then(() => res.status(201).json({ message: "Livre enregistré ! "}))
    .catch(error => {
      return res.status(400).json({ message: 'Erreur lors de l\'enregistrement du livre.' });
    });
}

exports.modifyBook = (req, res, next) => {
  console.log('Corps de la requête pour mofifier un livre:', req.body);
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: "Non autorisé" });
  }
  
  if (req.files && req.files.image) {
    let bookObject = JSON.parse(req.body.book);
    Book.findOne({_id: req.params.id})
    .then(book => {
      const filename = book.imageUrl.split('/images/')[1];

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
    let bookObject = req.body;
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
  console.log("req.body:", req.body);
  if ( req.body.rating < 0 || req.body.rating > 5 ) {
    return res.status(400).json({ message : 'La note doit être comprise entre 0 et 5'})
  }

  console.log("req.body.rating : ", req.body.rating);
  
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification si l'utilisateur a déjà noté ce livre
      const existingRating = book.ratings.find(rate => rate.userId === req.auth.userId);
      console.log("existingRating : ", existingRating);

      if (existingRating) {
        return res.status(400).json({ message: 'Vous avez déjà voté' });

      } else {
        // Ajout de la nouvelle note
        console.log("req.auth.userId : ", req.auth.userId, )
        book.ratings.push({ userId: req.auth.userId, grade: Math.round(req.body.rating) });

        // Calcul de la nouvelle moyenne
        const totalRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
        console.log("totalRatings : ", totalRatings)
        book.averageRating = Math.round(totalRatings / book.ratings.length);
        console.log("book.averageRating : ", book.averageRating);

        // Sauvegarde des modifications
        return book.save();
      }
    })
    .then((updatedBook) => res.status(201).json(updatedBook))
    .catch(error => res.status(400).json({ error }));
};
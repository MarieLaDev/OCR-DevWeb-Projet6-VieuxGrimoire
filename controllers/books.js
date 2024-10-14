const books = require('../models/books');
const Book = require('../models/books');
const fs = require('fs');

exports.createBook = (req, res, next) =>{
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
    .then(() => {res.status(201).json({ message: "Livre enregistré ! "})})
    .catch(error => res.status(400).json({error}))
}

exports.modifyBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
    .then((book) => {
      // Création d'un objet de mise à jour avec les nouvelles données
      const bookUpdate = {
        ...req.body,
        _id: req.params.id,
        // Déterminer si l'image a été modifiée
        imageUrl: req.file 
          ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
          : book.imageUrl
      };
      Book.updateOne({_id: req.params.id}, bookUpdate)
        .then(() => res.status(201).json({message: "Livre modifié !"}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}))
}

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
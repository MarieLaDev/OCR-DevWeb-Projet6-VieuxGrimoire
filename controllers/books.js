
const Book = require('../models/books');
const fs = require('fs');
const compressImage = require('../middleware/compressImage');
require('dotenv').config();


exports.createBook = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    // Vérification de la présence du fichier
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Vous devez télécharger une image." });
    }

    // Liste des champs requis
    const requiredFields = ['title', 'author', 'year', 'genre']; 

    // Vérification de la présence de tous les champs requis
    const missingFields = requiredFields.filter(field => !bookObject[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Vous devez remplir tous les champs. Champs Manquants : ${missingFields.join(", ")}`);
    }

    // Obtenir l'année actuelle
    const currentYear = new Date().getFullYear();
    
    const year = Number(bookObject.year);

    // Vérification de l'année : Nombre ? entre 1000 et l'année actuelle ?
    if (isNaN(year) || year <= 1000 || year > currentYear) {
      console.log("Erreur : année invalide");
      throw new Error("L'année doit être un nombre supérieur à 1000 et inférieur ou égal à l'année en cours.");
    }

    // Compression de l'image
    const { outputPath } = await compressImage(req.files.image);

    // Création du livre avec les informations reçues
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/${outputPath}`
    });

    // Sauvegarde du livre
    await book.save();

    res.status(201).json({ message: "Livre enregistré !" });
  } catch (error) {
    console.error("Erreur dans le bloc catch :", error.message);
    res.status(400).json({ message: error.message });
  }
};

exports.modifyBook = async (req, res, next) => {
  try {
    // Vérification de l'autorisation
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    let bookObject = req.files && req.files.image ? JSON.parse(req.body.book) : req.body;

    // Si une nouvelle image est fournie
    if (req.files && req.files.image) {
      // Récupération du livre actuel pour supprimer l'ancienne image
      const book = await Book.findOne({ _id: req.params.id });
      const filename = book.imageUrl.split(`/${process.env.IMG_PATH}`)[1];

      // Suppression de l'ancienne image
      fs.unlink(`images/${filename}`, (err) => {
        if (err) {
          return res.status(400).json({ message: `Erreur lors de la suppression de l'ancienne image : ${err}`});
        }
      });

      // Compression de la nouvelle image
      const { outputPath } = await compressImage(req.files.image);

      // Mise à jour du livre avec la nouvelle image
      const updatedBookData = {
        ...bookObject,
        _id: req.params.id,
        imageUrl: `${req.protocol}://${req.get('host')}/${outputPath}`
      };

      await Book.updateOne({ _id: req.params.id }, updatedBookData);
      return res.status(201).json({ message: "Livre modifié avec succès !" });
    } else {
      // Si aucune nouvelle image n'est fournie
      await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
      return res.status(201).json({ message: "Livre modifié avec succès !" });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
    .then(book => {
      const filename = book.imageUrl.split(`/${process.env.IMG_PATH}`)[1];
      fs.unlink(process.env.IMG_PATH + filename, () => {
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

exports.createRating = async (req, res, next) => {
  try {
    // Vérification de la validité de la note
    if (req.body.rating < 0 || req.body.rating > 5) {
      return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
    }

    // Récupérer le livre par son ID
    const book = await Book.findOne({ _id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérification si l'utilisateur a déjà noté ce livre
    const existingRating = book.ratings.find(rate => rate.userId === req.auth.userId);

    if (existingRating) {
      return res.status(400).json({ message: 'Vous avez déjà voté' });
    }

    // Ajout de la nouvelle note
    book.ratings.push({ userId: req.auth.userId, grade: Math.round(req.body.rating) });

    // Calcul de la nouvelle moyenne
    const totalRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
    book.averageRating = Math.round(totalRatings / book.ratings.length);

    // Sauvegarde des modifications
    const updatedBook = await book.save();

    res.status(201).json(updatedBook);
  } catch (error) {
    res.status(400).json({ error });
  }
};
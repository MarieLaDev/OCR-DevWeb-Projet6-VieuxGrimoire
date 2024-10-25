const bcrypt = require('bcrypt');
const jsonToken = require('jsonwebtoken');
require('dotenv').config();
const USER = require('../models/users');

exports.signup = async (req, res, next) => {
  try {
    // Hashage du mot de passe
    const hash = await bcrypt.hash(req.body.password, 10);

    // Création d'un nouvel utilisateur
    const user = new USER({
      email: req.body.email,
      password: hash
    });

    // Sauvegarde de l'utilisateur dans la base de données
    await user.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès !' });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Erreur serveur.' });
  }
};

exports.login = async (req, res, next) => {
  try {
    // Trouver l'utilisateur
    const user = await USER.findOne({ email: req.body.email });
    
    // Vérifie si l'utilisateur existe
    if (!user) {
      return res.status(401).json({ message: 'Accès non autorisé !' });
    }

    // Comparaison du mot de passe saisi avec celui enregistré dans la base
    const valid = await bcrypt.compare(req.body.password, user.password);
    
    if (!valid) {
      return res.status(401).json({ message: 'Accès non autorisé !' });
    }

    // Envoi de la réponse avec le token en cas de succès
    const token = jsonToken.sign(
      { userId: user._id },
      process.env.SECRET_TOKEN,
      { expiresIn: '24h' }
    );

    return res.status(200).json({ userId: user._id, token });

  } catch (error) {
    // Gestion des erreurs
    return res.status(500).json({ error });
  }
};
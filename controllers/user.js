const bcrypt = require('bcrypt');
const jsonToken = require('jsonwebtoken');
require('dotenv').config();
const USER = require('../models/users');
const { EmailAlreadyExistsError } = require('../utils/errors');

exports.signup = (req, res, next) => {
  // Vérifie si l'utilisateur existe déjà
  USER.findOne({ email: req.body.email })
    .then(existingUser => {
      if (existingUser) {
        return next(new EmailAlreadyExistsError());
      }
      
      bcrypt.hash(req.body.password, 10)
        .then(hash => {
          const user = new USER({
            email: req.body.email,
            password: hash
          });
          return user.save(); 
        })
        .then(() => res.status(201).json({ message: 'Utilisateur créé avec succès !' }))
        .catch(error => res.status(500).json({ message: error }));
    })
};

exports.login = (req, res, next) => {
  USER.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        return res.status(401).json({message: 'Accès non autorisé !'});
      }
      // Comparaison du mot de passe saisi avec celui enregistré dans la base
      return bcrypt.compare(req.body.password, user.password)
        .then(valid =>
          valid ?
            res.status(200).json({userId: user._id, token: jsonToken.sign(
              { userId: user._id },
              process.env.SECRET_TOKEN,
              { expiresIn: '24h'}
            )})
            : res.status(401).json({message: 'Accès non autorisé !'}))
      })
      .catch(error => res.status(500).json({error}));
}
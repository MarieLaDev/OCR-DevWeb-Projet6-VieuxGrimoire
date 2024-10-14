const bcrypt = require('bcrypt');
const jsonToken = require('jsonwebtoken');

const USER = require('../models/users');

exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new USER({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé avec succès !'}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}));
}

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
              "RANDOM_ONE_TOKEN_SECRET",
              { expiresIn: '24h'}
            )})
            : res.status(401).json({message: 'Accès non autorisé !'}))
      })
      .catch(error => res.status(500).json({error}));
}
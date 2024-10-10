const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/users');

exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Nouveau user enregistré !'}))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({error}));
}

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      // Vérification si l'utilisateur existe
      if (!user) {
        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
      }
      
      // Comparaison du mot de passe (ternaire)
      bcrypt.compare(req.body.password, user.password)
        .then(valid => 
          valid 
            ? res.status(200).json({userId: user._id, token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
          )}) 
            : res.status(401).json({ message: 'Paire login/mot de passe incorrecte' })
        );
    })
    .catch(error => res.status(500).json({ error }));
}
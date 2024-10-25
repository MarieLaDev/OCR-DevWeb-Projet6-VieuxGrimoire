const { check, validationResult } = require('express-validator');

const message = "Le mot de passe doit avoir plus de 8 caractères, contenir au moins : 1 majuscule, 1 miniscule, 1 chiffre, 1 caractère spécial";

const validateUser = [
  
  // Vérifie que l'email est bien un email valide
  check('email').isEmail().withMessage('Email invalide'),

  // Vérifie que le mot de passe respecte les critères
  check('password')
    .isLength({ min: 8 }).withMessage(message)
    .matches(/[A-Z]/).withMessage(message)
    .matches(/[a-z]/).withMessage(message)
    .matches(/[0-9]/).withMessage(message)
    .matches(/[\W]/).withMessage(message),

  // Gestion des erreurs de validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  }
];

module.exports = validateUser;

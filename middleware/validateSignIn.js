const { check, validationResult } = require('express-validator');

const validateUser = [
  // Vérifie que l'email est bien un email valide
  check('email').isEmail().withMessage('Email invalide'),

  // Vérifie que le mot de passe respecte les critères
  check('password')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit comporter au moins 8 caractères')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
    .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[\W]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial'),

  // Gestion des erreurs de validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateUser;

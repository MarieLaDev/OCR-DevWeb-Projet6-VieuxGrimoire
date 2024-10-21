const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware d'authentification => intercepte chaque requête faisant appel à 'auth', vérfie si le token est valide puis passe à la requête suivante ou renvoie un 401 
module.exports = (req, res, next) => {
  try {
      // Token stocké sous la forme 'bearer token', permet de ne conserver que le token
      const token = req.headers.authorization.split(' ')[1];
      
      // Décode le token avec la clé du fichier .env
      const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

      const userId = decodedToken.userId;

      req.auth = {
          userId: userId
      };

    next();

  } catch(error) {
      res.status(401).json({ error });
  }
};
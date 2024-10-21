const rateLimit = require('express-rate-limit');


// Définit une limite de 100 requêtes maximum par IP toutes les 15 minutes
const reqLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes (en millisecondes)
  max: 300, // Limite chaque IP à 300 requêtes par durée "windowMs"
  message: {message: "Trop de requêtes pour le moment, réessayez plus tard"},
  
  // paramétrage du temps d'attente avant une nouvelle requête
  handler: (req, res) => { 
    // Temps d'attente en secondes avant de pouvoir faire une nouvelle requête 
    res.set('Retry-After', ( 5 * 60 )); 

    // Envoi de la réponse avec un code d'erreur 429 (Too Many Requests)
    res.status(429).json({
      message: "Trop de requêtes pour le moment, réessayez dans 5 minutes."
    });
  }
});

module.exports = reqLimit
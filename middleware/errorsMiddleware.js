module.exports = (err, req, res, next) => {
  if (err.statusCode) {
    console.log(err.stack);
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Si ce n'est pas une erreur personnalisée, on renvoie un 500 par défaut
  return res.status(500).json({ message: "Erreur interne du serveur" });
};
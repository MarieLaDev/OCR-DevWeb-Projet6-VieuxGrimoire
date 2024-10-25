class CustomError extends Error {
  constructor(message, statusCode) {
    super(message); 
    this.name = this.constructor.name; 
    this.statusCode = statusCode; 
  }
}
class loginError extends CustomError {
  constructor(message = "Vous n'êtes pas autorisé à réaliser cette action !") {
    super(message, 401);
  }
}
class FileTypeError extends CustomError {
  constructor(message = "Le fichier n'est pas valide ou manquant") {
    super(message, 415); // Appelle le constructeur de CustomError avec un code 415
  }
}
class missingFiled extends CustomError {
  constructor(missingFields = []) {
    const message = `Vous devez remplir tous les champs. Champs Manquants : ${missingFields.join(", ")}`;
    super(message, 400);
  }
}
class yearError extends CustomError {
  constructor(year) {
    const message = `L'année ${year} n'est pas valide. L'année doit être un nombre supérieur à 1000 et inférieur ou égal à l'année en cours.`;
    super(message, 400); 
  }
}
class ratingError extends CustomError {
  constructor(message = "La note doit être comprise entre 0 et 5") {
    super(message, 400);
  }
}
// Exporte toutes les classes d'erreurs
module.exports = {
  CustomError,
  loginError,
  FileTypeError,
  missingFiled,
  yearError,
  ratingError
};
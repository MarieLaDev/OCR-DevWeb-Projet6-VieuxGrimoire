class CustomError extends Error {
  constructor(message, statusCode) {
    super(message); 
    this.name = this.constructor.name; 
    this.statusCode = statusCode; 
  }
}


class FileTypeError extends CustomError {
  constructor(message = "Le fichier n'est pas valide") {
    super(message, 415); // Appelle le constructeur de CustomError avec un code 415
  }
}

class EmailAlreadyExistsError extends CustomError {
  constructor(message = "L'email est déjà inscrit") {
    super(message, 409); // Code 409 pour "Conflict"
  }
}

// Exporte toutes les classes d'erreurs
module.exports = {
  CustomError,
  FileTypeError,
  EmailAlreadyExistsError
};
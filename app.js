const express = require('express');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
require('dotenv').config();
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const reqLimit = require('./middleware/reqLimit');
const path = require('path');
const errorMiddleware = require('./middleware/errorsMiddleware');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");

const app = express();

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Limite le nombre de requêtes en un temps donné (middleware reqLimit.js)
app.use(reqLimit);

app.use(fileUpload());

app.use(express.json());

app.use(mongoSanitize());

app.use(express.urlencoded({ extended: true }));

// Connexion à la base noSQL avec DB_HOST du fichier .env
mongoose.connect(process.env.DB_HOST)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Content-Security-Policy', "default-src 'self'; font-src 'self' https://fonts.gstatic.com;");
  
  next();
});


app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);

app.use(errorMiddleware);

module.exports = app;
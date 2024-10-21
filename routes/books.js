const express = require('express');
const auth = require('../middleware/auth');
const validateFile = require('../middleware/validateFile');
const bookCtrl = require('../controllers/books');
const router = express.Router();

router.get('/bestrating', bookCtrl.getBestRatingBooks);

router.post('/', auth, validateFile, bookCtrl.createBook);

router.put('/:id', auth, validateFile, bookCtrl.modifyBook);

router.delete('/:id', auth, bookCtrl.deleteBook);

router.get('/', bookCtrl.getAllBooks);

router.get('/:id', bookCtrl.getOneBook);

router.post('/:id/rating', auth, bookCtrl.createRating);

module.exports = router;
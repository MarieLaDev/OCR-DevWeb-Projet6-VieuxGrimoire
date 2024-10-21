const express = require('express');
const router = express.Router();
const validateUser = require('../middleware/validateSignIn');
const userCtrl = require('../controllers/user');

router.post('/signup', validateUser, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;
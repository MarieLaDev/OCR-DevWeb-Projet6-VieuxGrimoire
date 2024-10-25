const express = require('express');
const router = express.Router();
const validateUser = require('../middleware/validateSignIn');
const userCtrl = require('../controllers/user');
const { authLimit } = require('../middleware/reqLimit');

router.post('/signup', validateUser, userCtrl.signup);
router.post('/login', authLimit, userCtrl.login);

module.exports = router;
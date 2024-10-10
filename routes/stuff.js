const express = require('express');
const router = express.Router();
const stuffCtrl = require('../controllers/stuff');

router.post('/', stuffCtrl.createThing);

router.put('/:id', stuffCtrl.modifyThing);

router.delete('/:id', stuffCtrl.deleteThing);

router.get('/', stuffCtrl.getAllThings);

router.get('/:id', stuffCtrl.getOneThing);

module.exports = router;
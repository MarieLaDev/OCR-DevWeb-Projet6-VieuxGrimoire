const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: {type: String, required: true, unique: true },
  password: {type: String, required: true}
});

// {PATH} utilisé par mongoose unique validator pour remplacer {PATH} par le champ concerné
userSchema.plugin(uniqueValidator, { message: '{PATH} doit être unique.' });

module.exports = mongoose.model('user', userSchema);
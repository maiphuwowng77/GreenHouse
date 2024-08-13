const mongoose = require('mongoose');

const userSchema = {
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {type: Number},
  full_name: {type: String},
};

const user = mongoose.model('User', userSchema);

module.exports = user; 
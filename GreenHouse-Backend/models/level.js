const mongoose = require('mongoose');

const levelSchema = {
  level_code: {type: String},
  level_name: {type: String},
  factor_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Factor'},
  factor_code: {type: String, ref: 'Factor'},
};

const level = mongoose.model('Level', levelSchema);

module.exports = level; 
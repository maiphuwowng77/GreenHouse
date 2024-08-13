const mongoose = require('mongoose');

const factorSchema = {
  factor_code: {type: String},
  factor_name: {type: String},
  project_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
  project_code: {type: String},
};

const factor = mongoose.model('Factor', factorSchema);

module.exports = factor; 
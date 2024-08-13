const mongoose = require('mongoose');

const criterionSchema = {
  criterion_code: {type: String},
  criterion_name: {type: String},
  project_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
  project_code: {type: String}
};

const criterion = mongoose.model('Criterion', criterionSchema);

module.exports = criterion; 
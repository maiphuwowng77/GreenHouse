const mongoose = require('mongoose');

const projectDetailSchema = {
  project_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
  project_code: {type: String},
  criterion_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Criterion'},
  criterion_code: {type: String, ref: 'Criterion'},
  treatment_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Treatment'},
  treatment_code: {type: String, ref: 'Treatment'},
  input_batch_id: {type: mongoose.Schema.Types.ObjectId, ref: 'InputBatch'},
  block: {type: Number},
  replicate: {type: Number},
  column: {type: Number},
  plot: {type: String },
  value: {type: String}
};

const projectDetail = mongoose.model('ProjectDetail', projectDetailSchema);

module.exports = projectDetail; 
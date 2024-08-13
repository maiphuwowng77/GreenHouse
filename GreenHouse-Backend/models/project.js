const mongoose = require('mongoose');

const projectSchema = {
  project_code: {type: String},
  project_name: {type: String},
  description: {type: String},
  start_date: {type: Date },
  end_date: {type: Date},
  type_experiment: {type: Number},
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  owner_name: {type: String},
};

const project = mongoose.model('Project', projectSchema);

module.exports = project;
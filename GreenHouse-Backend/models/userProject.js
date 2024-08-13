const mongoose = require('mongoose');

const userProjectSchema = {
  project_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
  project_code: {type: String},
  user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  email: {type: String},
  role: {type: Number},
};

const userProject = mongoose.model('UserProject', userProjectSchema);

module.exports = userProject; 
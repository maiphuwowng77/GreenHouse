const mongoose = require('mongoose');

const inputBatchSchema = {
  order: {type: Number},
  project_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
  project_code: {type: String },
  start_date: {type: Date },
  end_date: {type: Date},
};

const inputBatch = mongoose.model('InputBatch', inputBatchSchema);

module.exports = inputBatch; 
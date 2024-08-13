const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  project_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
  project_code: {type: String},
  criterion_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Criterion'},
  criterion_code: {type: String},
  treatment_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Treatment'},
  treatment_code: {type: String},
  input_batch_id: {type: mongoose.Schema.Types.ObjectId, ref: 'InputBatch'},
  block: {type: Number},
  replicate: {type: Number},
  column: {type: Number},
  plot: {type: String},
  value: {type: String},
  oldValue: {type: String}, // Lưu trữ giá trị cũ
  timestamp: {type: Date, default: Date.now}, // Thời gian cập nhật
  updatedBy: {type: String} // Người thực hiện cập nhật
});

const history = mongoose.model('History', historySchema);
module.exports = history;

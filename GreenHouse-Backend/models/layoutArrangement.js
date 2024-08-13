const mongoose = require('mongoose');

const layoutArrangementSchema = {
  project_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
  project_code: {type: String },
  block: {type: Number},
  replicate: {type: Number},
  column: {type: Number},
  treatments: {type: [String]},
  layout: {type: [[[String]]]}
};

const layoutArrangement = mongoose.model('LayoutArrangement', layoutArrangementSchema);

module.exports = layoutArrangement; 
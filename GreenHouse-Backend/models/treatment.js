const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  factor_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Factor'},
  factor_code: {type: String},
  factor_name: {type: String},
  level_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Level'},
  level_code: {type: String},
  level_name: {type: String},
});

const treatmentSchema = {
  treatment_code: {type: String},
  treatment_name: {type: String},
  project_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
  project_code: {type: String},
  components: [componentSchema]
};

const treatment = mongoose.model('Treatment', treatmentSchema);

module.exports = treatment; 

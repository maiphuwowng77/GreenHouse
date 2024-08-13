const factorModel = require('../models/factor');
const levelModel = require('../models/level');
const treatmentModel = require('../models/treatment');
const mongoose = require('mongoose');
const { ModelState} = require('../enums/enums');

async function getByProjectId(id) {
  var results = {};
  const factor = await factorModel.find({ project_id: id});
  results.factor = factor;
  
  const factorIds = factor.map(x => {
    return x._id
  });
  results.level = await levelModel.find({ factor_id: {$in: factorIds}});
  return results;
}

async function create(data) {
  const { factor, level } = data.data;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await factorModel.insertMany(factor,  {session: session});
    await levelModel.insertMany(level,  {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
  }
}

async function update(updateData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // update factor
    var factor = updateData.factor;
    var factorDB = await factorModel.find({ project_id: factor[0].project_id});
    var levelDB = await levelModel.find({ project_id: factor[0]._id});
    var delFactor = factorDB.map(x => {
      return x._id;
    });
    await factorModel.deleteMany({ _id : {$in: delFactor} },  {session: session});
    await factorModel.insertMany(factor,  {session: session});

    // update level
    var level = updateData.level;
    var delLevel = levelDB.map(x => {
      return x._id;
    });

    await levelModel.deleteMany({ _id : {$in: delLevel} },  {session: session});
    await levelModel.insertMany(level,  {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    throw error;
  }
  return updateData;
}

async function deleteByProjectId(project_id, factor_id) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await factorModel.deleteMany({ project_id: project_id }, {session: session});
    await levelModel.deleteMany({ factor_id: factor_id }, {session: session});
    await treatmentModel.deleteMany({ project_id: project_id }, {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) { 
      await session.abortTransaction();
      session.endSession();
      throw error;
  }
}

async function getLevelByFactorId(id) {
  return await levelModel.find({ factor_id: id});
}


module.exports = {
  getByProjectId,
  create,
  update,
  deleteByProjectId,
  getLevelByFactorId,
};

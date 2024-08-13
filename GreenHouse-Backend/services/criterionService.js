const criterionModel = require('../models/criterion');
const mongoose = require('mongoose');
const { ModelState} = require('../enums/enums');

async function getByProjectId(id) {
  return await criterionModel.find({ project_id: id});
}

async function create(data) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await criterionModel.insertMany(data.data, {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
  }
}

async function update(updateData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    var criterionDB = await criterionModel.find({ project_id: updateData[0].project_id});
    var delCriterion = criterionDB.map(x => {
      return x._id;
    });

    await criterionModel.deleteMany({ _id : {$in: delCriterion} },  {session: session});
    await criterionModel.insertMany(updateData,  {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
  }
  return updateData;
}

async function deleteById(criterion) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    var del = criterion.map(x => {
      return x._id;
    });
    console.log(del);
    await criterionModel.deleteMany({ _id : {$in: del} },  {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
  }
}


module.exports = {
  getByProjectId,
  create,
  update,
  deleteById,
};

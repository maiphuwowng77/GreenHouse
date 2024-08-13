const inputBatchModel = require('../models/inputBatch');
const projectModel = require('../models/project');
const mongoose = require('mongoose');
const { ModelState} = require('../enums/enums');

async function getByProjectId(id) {
  return await inputBatchModel.find({ project_id: id});
}

async function create(data) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    var project = data.project;
    await projectModel.findOneAndUpdate({ _id: project._id }, {end_date: project.end_date}, { session: session });
    var inputBatch = data.inputBatch;

    await inputBatchModel.deleteMany({ project_id: project._id}, {session: session});
    await inputBatchModel.insertMany(inputBatch, {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.log(error);
      await session.abortTransaction();
      session.endSession();
  }
}

async function update(updateData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const bulkOperations = updateData.map(x => ({
      updateOne: {
        filter: { _id: x._id },
        update: { $set: x },
        upsert: true
      }
    }));
    await inputBatchModel.bulkWrite(bulkOperations, {session: session});

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
    await inputBatchModel.deleteMany({ _id : {$in: del} },  {session: session});

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

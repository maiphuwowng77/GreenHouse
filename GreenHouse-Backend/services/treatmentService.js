const treatmentModel = require('../models/treatment');
const mongoose = require('mongoose');

async function getByProjectId(id) {
  return await treatmentModel.find({ project_id: id});
}

async function create(data) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await treatmentModel.insertMany(data.data, {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function update(updateData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    var treatmentDB = await treatmentModel.find({ project_id: updateData[0].project_id});
    var delTreatment = treatmentDB.map(x => {
      return x._id;
    });

    await treatmentModel.deleteMany({ _id : {$in: delTreatment} },  {session: session});
    await treatmentModel.insertMany(updateData,  {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
      await session.abortTransaction();
      session.endSession();
  }
  return updateData;
}

async function deleteById(treatment) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await treatmentModel.findByIdAndDelete(treatment._id, {session: session});

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

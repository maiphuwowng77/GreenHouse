const userModel = require('../models/user');
const mongoose = require('mongoose');

async function getAllUser() {
  let user = await userModel.find();
  return user.map(x => {
    return {
      _id: x._id,
      email: x.email,
      full_name: x.full_name,
      role: x.role
    }
  });
}

async function getPaging(params) {
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  
  const results = {};
  const users = await userModel.find()
  .sort({ full_name: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .exec();
  
  results.users = users;

  return results;
}

async function addUser(users) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await userModel.insertMany(users,  {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
      await session.abortTransaction();
      session.endSession();
  }
}

module.exports = {
  getAllUser,
  getPaging,
  addUser
};

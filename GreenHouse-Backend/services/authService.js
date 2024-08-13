const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const dotenv = require('dotenv');

dotenv.config();

async function login(params) {
  const user = await userModel.findOne({ email: params.email });
  if (!user) {
    throw new Error('User not found');
  }
  
  const isMatch = await bcrypt.compare(params.password, user.password);
  if (!isMatch) {
    throw new Error('Wrong password');
  }

  const payload = {
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    }
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' });
}

async function signup(data) {
  const existingUser = await userModel.findOne({ email: data.email });
  if (existingUser) {
    throw new Error('Email already exists');
  }
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = {
    email: data.email,
    password: hashedPassword,
    role: data.role,
    full_name: data.full_name,
  };
  await userModel.create(newUser);
  return newUser;
}

async function getPaging(params) {
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  
  const results = {};
  const users = await userModel.find()
  .sort({ create_date: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .exec();
  
  results.users = users;

  return results;
};

async function editUser(data) {
  const id = data._id;
  await userModel.findByIdAndUpdate(id, data);
};

async function deleteUser(id) {
  await userModel.findByIdAndDelete(id);
}

async function changePassword(data) {
  if (!data || !data.email) {
    throw new Error('Email is required');
  }

  const user = await userModel.findOne({ email: data.email });
  if (!user) {
    throw new Error('User not found');
  }
  
  const isMatch = await bcrypt.compare(data.currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);
  await userModel.updateOne({ email: data.email }, { password: hashedPassword });
}

module.exports = {
  changePassword,
  // other functions...
};

module.exports = {
  login,
  signup,
  getPaging,
  editUser,
  deleteUser,
  changePassword
};

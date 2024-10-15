const projectModel = require('../models/project');
const userProjectModel = require('../models/userProject');
const userModel = require('../models/user');
const mongoose = require('mongoose');
const { ModelState} = require('../enums/enums');
const factorModel = require('../models/factor');
const treatmentModel = require('../models/treatment');
const criterionModel = require('../models/criterion');
const layoutArrangementModel = require('../models/layoutArrangement');
const projectDetailModel = require('../models/projectDetail');
const levelModel = require('../models/level');
const inputBatchModel = require('../models/inputBatch');
const historyModel = require('../models/history');

async function getPaging(params) {
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  
  const results = {};
  const projects = await projectModel.find()
  .sort({ create_date: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .exec();
  
  results.projects = projects;

  return results;
};

async function getById(id) {
  var results = {};
  results.project = await projectModel.findById(id);
  var userProjects = await userProjectModel.find({ project_id: id});

  var listUserId = userProjects.map(x => x.user_id);

  var userList = await userModel.find({ _id: { $in: listUserId } });
  results.userProject = userProjects.map(x => {
    let user = userList.find(y => y._id.toString() == x.user_id.toString());
    return {
      _id: x._id,
      project_id: x.project_id,
      project_code: x.project_code,
      user_id: x.user_id,
      email: user.email,
      full_name: user.full_name,
      role: x.role
    }
  });

  return results;
}

async function createProject(projectData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    await projectModel.create([projectData.project],  {session: session});
    await userProjectModel.insertMany(projectData.userProject,  {session: session});

    var dateInputBatch = new Date();
    if(projectData.project.start_date == null || projectData.project.start_date == undefined) {
      dateInputBatch = new Date();
    } else {
      dateInputBatch = new Date(projectData.project.start_date);
    }
    var inputBatchDefault = {
      order: 1,
      start_date: dateInputBatch,
      end_date: dateInputBatch,
      project_id: projectData.project._id,
      project_code: projectData.project.project_code,
    };
    await inputBatchModel.create([inputBatchDefault], {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function updateProject(updateData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    var project = updateData.project;
    var _idProject = project._id;
    await projectModel.updateOne({ _id: _idProject }, { $set: { ...project}}, {session: session});

    var userProject = updateData.userProject;
    var del = await userProjectModel.find({ project_id: _idProject });
    var listIdDel = del.map(x => x._id);
    await userProjectModel.deleteMany({ _id : {$in: listIdDel} },  {session: session});
    await userProjectModel.insertMany(userProject, {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
  }
  return updateData;
}

async function deleteProject(id) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await projectModel.findByIdAndDelete(id, {session: session});
    await userProjectModel.deleteMany({project_id: id}, {session: session});
    
    // factor, level
    let factor_id = (await factorModel.find({ project_id: id})).map(x => x._id);
    await factorModel.deleteMany({project_id: id}, {session: session});
    await levelModel.deleteMany({factor_id : {$in: factor_id}}, {session: session});

    // treatment
    await treatmentModel.deleteMany({project_id: id}, {session: session});

    // criterion
    await criterionModel.deleteMany({project_id: id}, {session: session});

    // layoutArrangement
    await layoutArrangementModel.deleteMany({project_id: id}, {session: session});

    // inputBatch
    await inputBatchModel.deleteMany({project_id: id}, {session: session});

    // projectDetail
    await projectDetailModel.deleteMany({project_id: id}, {session: session});

    // history
    await historyModel.deleteMany({project_id: id}, {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
  }
}

async function generateCode(userId) {
  let user =  await userModel.findById(userId);
  let name = toLowerCaseNonAccentVietnamese(user.full_name);
  let parts = name.split(' ');
  let code = parts.slice(0, -1).map(part => part[0]).join('') + parts[parts.length - 1];

  let projects = (await projectModel.find({ project_code: {"$regex": `${code}`}})).map(x => x.project_code);
  projects.sort((a, b) => {
    let numA = parseInt(a.match(/\d+$/)[0]);
    let numB = parseInt(b.match(/\d+$/)[0]);
    return numA - numB;
  });
  if(projects.length == 0 || projects[projects.length - 1].match(/\d+$/) == null) return `${code}001`;
  let lastNumber = parseInt(projects[projects.length - 1].match(/\d+$/)[0]);
  let nextNumber = lastNumber + 1;
  return `${code}${nextNumber.toString().padStart(3, '0')}`;
}

function toLowerCaseNonAccentVietnamese(str) {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
  str = str.replace(/\u02C6|\u0306|\u031B/g, "");
  return str;
}

module.exports = {
  getById,
  createProject,
  updateProject,
  deleteProject,
  getPaging,
  generateCode
};

const projectService = require('../services/projectService');


async function getById(req, res) {
  try {
    const item = await projectService.getById(req.query.id);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function getPaging(req, res) {
  try {
    const data = await projectService.getPaging(req.query);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function createProject(req, res) {
  try {
    await projectService.createProject(req.body);
    res.status(201).json(true);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function updateProject(req, res) {
  try {
    await projectService.updateProject(req.body);
    res.status(200).json(true);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function deleteProject(req, res) {
  try {
    await projectService.deleteProject(req.query.id);
    res.status(200).json(true);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function generateCode(req, res) {
  try {
    const data = await projectService.generateCode(req.query.userId);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

module.exports = {
  getById,
  createProject,
  updateProject,
  deleteProject,
  getPaging,
  generateCode,
};

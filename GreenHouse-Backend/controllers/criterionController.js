const criterionService = require('../services/criterionService');

async function getByProjectId(req, res) {
  try {
    const item = await criterionService.getByProjectId(req.query.project_id);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json(error);;
  }
}

async function create(req, res) {
  try {
    await criterionService.create(req.body);
    res.status(201).json(true);
  } catch (error) {
    res.status(500).json(error);;
  }
}

async function update(req, res) {
  try {
    await criterionService.update(req.body.updateData);
    res.status(200).json(true);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function deleteById(req, res) {
  try {
    await criterionService.deleteById(req.body);
    res.status(200).json(true);
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = {
  getByProjectId,
  create,
  update,
  deleteById,
};

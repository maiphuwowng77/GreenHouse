const inputBatchService = require('../services/inputBatchService');

async function getByProjectId(req, res) {
  try {
    const item = await inputBatchService.getByProjectId(req.query.project_id);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json(error);;
  }
}

async function create(req, res) {
  try {
    await inputBatchService.create(req.body.data);
    res.status(201).json(true);
  } catch (error) {
    res.status(500).json(error);;
  }
}

async function update(req, res) {
  try {
    await inputBatchService.update(req.body);
    res.status(200).json(true);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function deleteById(req, res) {
  try {
    await inputBatchService.deleteById(req.body);
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

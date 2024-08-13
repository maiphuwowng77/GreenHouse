const factorService = require('../services/factorService');

async function getByProjectId(req, res) {
  try {
    const item = await factorService.getByProjectId(req.query.project_id);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function create(req, res) {
  try {
    await factorService.create(req.body);
    res.status(201).json(true);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function update(req, res) {
  try {
    await factorService.update(req.body.updateData);
    res.status(200).json(true);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function deleteByProjectId(req, res) {
  try {
    await factorService.deleteByProjectId(req.body);
    res.status(200).json(true);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function getLevelByFactorId(req, res) {
  try {
    const item = await factorService.getLevelByFactorId(req.query.factor_id);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = {
  getByProjectId,
  create,
  update,
  deleteByProjectId,
  getLevelByFactorId
};

const layoutArrangementService = require('../services/layoutArrangementService');

async function generateLayout(req, res) {
  try {
    const item = await layoutArrangementService.generateLayout(req.body);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json(error);;
  }
}

async function saveLayout(req, res) {
  try {
    await layoutArrangementService.saveLayout(req.body.data);
    res.status(201).json(true);
  } catch (error) {
    res.status(500).json(error);;
  }
}

async function getByProjectId(req, res) {
  try {
    const item = await layoutArrangementService.getByProjectId(req.query.project_id);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json(error);;
  }
}

module.exports = {
  generateLayout,
  saveLayout,
  getByProjectId,
};

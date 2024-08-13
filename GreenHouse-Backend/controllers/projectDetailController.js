const projectDetailService = require('../services/projectDetailService');


async function getDataByCell(req, res) {
  try {
    const item = await projectDetailService.getDataByCell(req.query);
    res.status(200).json(item);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function getDataByInputBatch(req, res) {
  try {
    const item = await projectDetailService.getDataByInputBatch(req.query);
    res.status(200).json(item);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function create(req, res) {
  try {
    const data = await projectDetailService.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function update(req, res) {
  try {
    const data = await projectDetailService.update(req.query.userId, req.body);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function deleteById(req, res) {
  try {
    await projectDetailService.deleteById(req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function checkDeleteProject(req, res) {
  try {
    let item = await projectDetailService.checkDeleteProject(req.query.projectId);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function exportData(req, res) {
  try {
    let workbook = await projectDetailService.exportData(req.query.projectId);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Export.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

module.exports = {
  getDataByCell,
  create,
  update,
  deleteById,
  checkDeleteProject,
  exportData,
  getDataByInputBatch
};

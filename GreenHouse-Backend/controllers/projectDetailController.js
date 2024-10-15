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

async function getHistoryByCell(req, res) {
  try {
    const item = await projectDetailService.getHistoryByCell(req.query);
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

async function importData(req, res) {
  try {
    //console.log(req.file); // In ra để kiểm tra file có được nhận đúng không
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let data = await projectDetailService.importData(req.query.userId, req.query.input_batch_id, req.query.project_id, req.file.buffer); // Sử dụng req.file.buffer để xử lý file Excel
    res.status(200).json(data);
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: error.message });
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

async function exportSchema(req, res) {
  try {
    let workbook = await projectDetailService.exportSchema(req.query.projectId, req.query.inputBatchId);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Export-Schema.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function exportHistoryData(req, res) {
  try {
    let workbook = await projectDetailService.exportHistoryData(req.query);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Export_History.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function exportHistoryData(req, res) {
  try {
    let workbook = await projectDetailService.exportHistoryData(req.query);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Export_History.xlsx'
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
  importData,
  getDataByInputBatch,
  getHistoryByCell,
  exportHistoryData,
  exportSchema
};

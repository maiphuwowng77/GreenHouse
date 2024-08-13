const projectDetailModel = require('../models/projectDetail');
const historyModel = require('../models/history');
const mongoose = require('mongoose');
const { TypeExperiment, ModelState } = require('../enums/enums');
const criterionModel = require('../models/criterion');
const treatmentModel = require('../models/treatment');
const inputBatchModel = require('../models/inputBatch');
const express = require('express');
const ExcelJS = require('exceljs');

async function getDataByCell(params) {
  const { input_batch_id, project_id, block, replicate, column } = params;
  let detailData = await projectDetailModel.find({
    project_id: project_id,
    input_batch_id: input_batch_id,
    block: block,
    replicate: replicate,
    column: column
  });


  return detailData;
}

async function getDataByInputBatch(params) {
  const { input_batch_id, project_id, criterion_id } = params;
  let detailData = await projectDetailModel.find({
    input_batch_id: input_batch_id,
    project_id: project_id,
    criterion_id: criterion_id,
  });

  return detailData;
}

async function create(data) {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await projectDetailModel.insertMany(data,  {session: session});

    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
  }
}

async function update(user, data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Phân loại dữ liệu cần chèn và cập nhật
    var dataInsert = data.filter(x => x._id == null || x._id == undefined);
    var dataUpdate = data.filter(x => x._id != null && x._id != undefined);

    // Chèn dữ liệu mới
    if (dataInsert.length > 0) {
      await projectDetailModel.insertMany(dataInsert, { session: session });
      // Tạo các bản ghi lịch sử cho dữ liệu chèn mới
      const historyEntriesInsert = dataInsert.map(newData => ({
        project_id: newData.project_id,
        criterion_id: newData.criterion_id,
        treatment_id: newData.treatment_id,
        input_batch_id: newData.input_batch_id,
        block: newData.block,
        replicate: newData.replicate,
        column: newData.column,
        plot: newData.plot,
        oldValue: '',
        value: newData.value,
        updatedBy: user,
        timestamp: new Date()
      }));

      // Lưu các bản ghi lịch sử cho dữ liệu chèn mới
      if (historyEntriesInsert.length > 0) {
        await historyModel.insertMany(historyEntriesInsert, { session });
      }
    }

    // Cập nhật dữ liệu hiện có
    if (dataUpdate.length > 0) {
      const currentData = await projectDetailModel.find({
        _id: { $in: dataUpdate.map(x => x._id) }
      }).session(session);

      // Tạo các thao tác cập nhật và lưu lịch sử khi có sự thay đổi
      const bulkOperations = [];
      const historyEntries = [];

      dataUpdate.forEach(newData => {
        const oldData = currentData.find(d => d._id.equals(newData._id));
        const updateFields = {};

        // So sánh và chỉ thêm các trường khác nhau
        if (newData.value !== oldData.value) {
          bulkOperations.push({
            updateOne: {
              filter: { _id: newData._id },
              update: { $set: { value: newData.value } },
              upsert: true
            }
          });

          historyEntries.push({
            project_id: newData.project_id,
            criterion_id: newData.criterion_id,
            treatment_id: newData.treatment_id,
            input_batch_id: newData.input_batch_id,
            block: newData.block,
            replicate: newData.replicate,
            column: newData.column,
            plot: newData.plot,
            oldValue: oldData.value,
            value: newData.value,
            updatedBy: user,
            timestamp: new Date()
          });
        }
      });

      // Thực hiện các thao tác cập nhật nếu có
      if (bulkOperations.length > 0) {
        await projectDetailModel.bulkWrite(bulkOperations, { session: session });
      }

      // Lưu các bản ghi lịch sử nếu có
      if (historyEntries.length > 0) {
        await historyModel.insertMany(historyEntries, { session: session });
      }
    }

    // Cam kết transaction
    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (error) {
    // Hủy bỏ transaction nếu có lỗi
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}


async function deleteById(data) {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await projectDetailModel.findByIdAndDelete(data._id, {session: session});

    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
  }
}

async function checkDeleteProject(projectId) {
  var result = false;
  var dataDetail = await projectDetailModel.find({ project_id: projectId});
  if(dataDetail != null && dataDetail.length > 0) {
    result = true;
  }
  return result;
}

async function exportData(projectId) {
  var data = await projectDetailModel.find({ project_id: projectId});
  var criterion = await criterionModel.find({ project_id: projectId});
  var inputBatch = await inputBatchModel.find({ project_id: projectId});

  const groupedData = data.reduce((acc, item) => {
    const key = `${item.treatment_code}-${item.block}-${item.replicate}-${item.column}-${item.plot}`;
    if (!acc[key]) {
      acc[key] = {
        plot: item.plot,
        input_batch_id: item.input_batch_id,
        treatment_code: item.treatment_code,
        block: item.block,
        replicate: item.replicate,
        column: item.column,
      };
    }
    const value = Number(item.value);
    acc[key][item.criterion_code] = isNaN(value) ? undefined : value;
    return acc;
  }, {});
  
  const result = Object.values(groupedData).map(item => {
    const inputBatchItem = inputBatch.find(batch => batch._id.toString() == item.input_batch_id.toString());
    return {
      ...item,
      input_batch: inputBatchItem 
      ? `Batch ${inputBatchItem.order} (${new Date(inputBatchItem.start_date).toLocaleDateString('en-GB')} - ${new Date(inputBatchItem.end_date).toLocaleDateString('en-GB')})` 
      : null,
    };
  });

  result.sort((a, b) => {
    if (a.plot < b.plot) {
      return -1;
    }
    if (a.plot > b.plot) {
      return 1;
    }
    return 0;
  });

  var workbook = new ExcelJS.Workbook();
  var worksheet = workbook.addWorksheet('Summary');
  let columnCriterion = criterion.map(x => {
    return { header: x.criterion_name, key: x.criterion_code, width: 20 }
  });
  worksheet.columns = [
    { header: 'Plot', key: 'plot', width: 10 },
    { header: 'Input Batch', key: 'input_batch', width: 30 },
    { header: 'Block', key: 'block', width: 10 },
    { header: 'Treatment', key: 'treatment_code', width: 10 },
    ...columnCriterion
  ];

  result.forEach(item => {
    worksheet.addRow(item);
  });

  return workbook;
}

module.exports = {
  getDataByCell,
  create,
  update,
  deleteById,
  checkDeleteProject,
  exportData,
  getDataByInputBatch,
};

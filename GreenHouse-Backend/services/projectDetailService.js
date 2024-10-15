const projectDetailModel = require('../models/projectDetail');
const historyModel = require('../models/history');
const mongoose = require('mongoose');
const { TypeExperiment, ModelState } = require('../enums/enums');
const criterionModel = require('../models/criterion');
const treatmentModel = require('../models/treatment');
const inputBatchModel = require('../models/inputBatch');
const layoutArrangementModel = require('../models/layoutArrangement');
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

async function getHistoryByCell(params) {
  const { input_batch_id, project_id, block, replicate, column } = params;
  let historyData = await historyModel.find({
    project_id: project_id,
    input_batch_id: input_batch_id,
    block: block,
    replicate: replicate,
    column: column
  });


  return historyData;
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
        criterion_code: newData.criterion_code,
        treatment_id: newData.treatment_id,
        treatment_code: newData.treatment_code,
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
            criterion_code: newData.criterion_code,
            treatment_id: newData.treatment_id,
            treatment_code: newData.treatment_code,
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

async function exportSchema(projectId, inputBatchId) {
  const layoutArrangement = await layoutArrangementModel.findOne({ project_id: projectId });
  const criterion = await criterionModel.find({ project_id: projectId });
  var inputBatch = await inputBatchModel.find({ project_id: projectId});
  const inputBatchItem = inputBatch.find(batch => batch._id.toString() == inputBatchId.toString());

  if (!layoutArrangement || !inputBatch) {
    throw new Error('Layout arrangement or input batch not found');
  }

  const { layout, treatments } = layoutArrangement;
  const treatmentOrderMap = treatments.reduce((acc, treatment, index) => {
    acc[treatment] = index;
    return acc;
  }, {});
  // Xây dựng dữ liệu cho worksheet
  const result = [];

  // Duyệt qua layout để tạo dữ liệu
  const generateData = (layout) => {
    layout.forEach((block, blockIndex) => {
      block.forEach((replicate, replicateIndex) => {
        replicate.forEach((column, columnIndex) => {
          if (column) {
            result.push({
              plot: `${blockIndex + 1}.${replicateIndex + 1}.${columnIndex + 1}`,
              input_batch: inputBatchItem 
              ? `Batch ${inputBatchItem.order} (${new Date(inputBatchItem.start_date).toLocaleDateString('en-GB')} - ${new Date(inputBatchItem.end_date).toLocaleDateString('en-GB')})` 
              : null,
              block: blockIndex + 1,
              replicate: replicateIndex + 1,
              treatment_code: column,
              ...criterion.reduce((acc, crit) => ({ ...acc, [crit.criterion_code]: '' }), {})
            });
          }
        });
      });
    });
  };

  generateData(layout);

  // Tạo workbook và worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Schema');

  // Cấu hình các cột cho worksheet
  const columnCriterion = criterion.map(x => ({
    header: x.criterion_name,
    key: x.criterion_code,
    width: 20
  }));

  result.sort((a, b) => {
    // Sắp xếp theo block
    if (a.block < b.block) {
      return -1;
    }
    if (a.block > b.block) {
      return 1;
    }

    // Nếu block bằng nhau, sắp xếp theo treatment_code dựa trên thứ tự trong mảng treatments
    return treatmentOrderMap[a.treatment_code] - treatmentOrderMap[b.treatment_code];
  });

  worksheet.columns = [
    { header: 'Plot', key: 'plot', width: 15 },
    { header: 'Input Batch', key: 'input_batch', width: 30 },
    { header: 'Block', key: 'block', width: 10 },
    { header: 'Treatment', key: 'treatment_code', width: 20 },
    ...columnCriterion
  ];

  // Thêm các hàng vào worksheet
  result.forEach(item => {
    worksheet.addRow(item);
  });

  return workbook;
}

async function importData(userId, input_batch_id, project_id, formData) {
  console.log(input_batch_id);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Đọc dữ liệu từ file Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(formData.buffer);
    const worksheet = workbook.getWorksheet(1);
    const criterion_list = [];

    // Xử lý dữ liệu từ file Excel
    const data = [];
    const rows = worksheet.getRows(1, worksheet.rowCount); // Lấy tất cả các hàng từ sheet

    // Xử lý hàng tiêu đề để lấy các cột criterion
    const headerRow = rows[0];
    const numberOfColumns = headerRow.cellCount;
    for (let i = 5; i <= numberOfColumns; i++) {
      criterion_list.push(headerRow.getCell(i).value); // Lưu giá trị của cột criterion
    }

    // Xử lý các hàng dữ liệu
    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const plot = row.getCell(1).value; // Cột Plot
      const [block, replicate, columnValue] = plot.split('.').map(Number);
      const treatment_code = row.getCell(4).value; // Cột Treatment Code
      const treatment = await treatmentModel.findOne({ treatment_code: treatment_code, project_id: project_id }).session(session);

      for (let i = 0; i < criterion_list.length; i++) {
        const criterion_code = criterion_list[i];
        const value = row.getCell(5 + i).value; // Cột Value
        const criterion = await criterionModel.findOne({ criterion_code: criterion_code, project_id: project_id }).session(session);

        if (!treatment || !criterion) {
          throw new Error(`Treatment or Criterion not found: ${treatment_code}, ${criterion_code}`);
        }

        data.push({
          project_id: project_id,
          project_code: treatment.project_code,
          criterion_id: criterion._id,
          criterion_code: criterion_code,
          treatment_id: treatment._id,
          treatment_code: treatment_code,
          input_batch_id: input_batch_id,
          block: block,
          replicate: replicate,
          column: columnValue,
          plot: plot,
          value: value,
        });
      }
    }

    console.log(data);

    // Xử lý các bản ghi để chèn hoặc cập nhật và tạo lịch sử
    const bulkOperations = [];
    const historyEntries = [];

    for (const newData of data) {
      const existingRecord = await projectDetailModel.findOne({
        project_id: newData.project_id,
        criterion_id: newData.criterion_id,
        plot: newData.plot,
        input_batch_id: input_batch_id,
      }).session(session);

      if (existingRecord) {
        if (existingRecord.value !== newData.value) {
          historyEntries.push({
            project_id: newData.project_id,
            criterion_id: newData.criterion_id,
            criterion_code: newData.criterion_code,
            treatment_id: newData.treatment_id,
            treatment_code: newData.treatment_code,
            input_batch_id: newData.input_batch_id,
            block: newData.block,
            replicate: newData.replicate,
            column: newData.column,
            plot: newData.plot,
            oldValue: existingRecord.value,
            value: newData.value,
            updatedBy: userId,
            timestamp: new Date()
          });

          bulkOperations.push({
            updateOne: {
              filter: {
                project_id: newData.project_id,
                criterion_id: newData.criterion_id,
                plot: newData.plot,
                input_batch_id: input_batch_id,
              },
              update: { $set: { value: newData.value } }
            }
          });
        }
      } else {
        historyEntries.push({
          project_id: newData.project_id,
          criterion_id: newData.criterion_id,
          criterion_code: newData.criterion_code,
          treatment_id: newData.treatment_id,
          treatment_code: newData.treatment_code,
          input_batch_id: newData.input_batch_id,
          block: newData.block,
          replicate: newData.replicate,
          column: newData.column,
          plot: newData.plot,
          oldValue: '',  // oldValue rỗng
          value: newData.value,
          updatedBy: userId,
          timestamp: new Date()
        });

        bulkOperations.push({
          insertOne: {
            document: newData
          }
        });
      }
    }

    // Thực hiện các thao tác cơ sở dữ liệu
    if (bulkOperations.length > 0) {
      await projectDetailModel.bulkWrite(bulkOperations, { session });
      //console.log(bulkOperations);
    }

    if (historyEntries.length > 0) {
      await historyModel.insertMany(historyEntries, { session });
      //console.log(historyEntries);
    }

    // Cam kết transaction
    await session.commitTransaction();
    session.endSession();

    return { success: true };
  } catch (error) {
    // Hủy bỏ transaction nếu có lỗi
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}


async function exportHistoryData(params) {
  // Destructuring params
  const { input_batch_id, project_id, block, replicate, column } = params;
  var inputBatch = await inputBatchModel.find({ project_id: project_id});

  // Lấy dữ liệu từ historyModel theo params
  const historyData = await historyModel.find({
    project_id: project_id,
    input_batch_id: input_batch_id,
    block: block,
    replicate: replicate,
    column: column
  });

  // Chuyển đổi giá trị trong cột `value` và `oldValue` thành số, kiểm tra NaN
  const transformedData = historyData.map(item => {
    const timestamp = new Date(item.timestamp).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const inputBatchItem = inputBatch.find(batch => batch._id.toString() == item.input_batch_id.toString());
    return {
      ...item,
      plot: item.plot,
      treatment_code: item.treatment_code,
      block: item.block,
      criterion_code: item.criterion_code,
      input_batch: inputBatchItem 
      ? `Batch ${inputBatchItem.order} (${new Date(inputBatchItem.start_date).toLocaleDateString('en-GB')} - ${new Date(inputBatchItem.end_date).toLocaleDateString('en-GB')})` 
      : null,
      value: isNaN(Number(item.value)) ? null : Number(item.value),
      oldValue: isNaN(Number(item.oldValue)) ? null : Number(item.oldValue),
      time: timestamp
    };
  });

  // Tạo workbook và worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('History Data');

  // Định nghĩa cột cho worksheet
  worksheet.columns = [
    { header: 'Plot', key: 'plot', width: 10 },
    { header: 'Input Batch', key: 'input_batch', width: 30 },
    { header: 'Block', key: 'block', width: 10 },
    { header: 'Treatment', key: 'treatment_code', width: 10 },
    { header: 'Criterion', key: 'criterion_code', width: 25 },
    { header: 'Old value', key: 'oldValue', width: 15 },
    { header: 'New value', key: 'value', width: 15 },
    { header: 'Time', key: 'time', width: 25 }
  ];

  transformedData.forEach(item => {
    worksheet.addRow(item);
  });

  // Trả về workbook
  return workbook;
}

module.exports = {
  getDataByCell,
  create,
  update,
  deleteById,
  checkDeleteProject,
  exportData,
  importData,
  getDataByInputBatch,
  getHistoryByCell,
  exportHistoryData,
  exportSchema
};

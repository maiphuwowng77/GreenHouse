const layoutArrangementModel = require('../models/layoutArrangement');
const projectModel = require('../models/project');
const treatmentService = require('./treatmentService');
const { ModelState, TypeExperiment} = require('../enums/enums');
const mongoose = require('mongoose');

async function generateLayout(data) {
  const { block, column, replicate, treatments, typeExperiment } = data.layoutParams;
  let layout = [];
  switch (typeExperiment) {
    case TypeExperiment.RCBD:
      layout = createRCBDMatrix(block, column, replicate, treatments);
      break;
    case TypeExperiment.CRD:
      layout = createRCDMatrix(replicate, column, treatments);
      break;
  }
  
  return layout;
}

function createRCBDMatrix(numBlocks, numColumn, numReplicates, formulas) {
  let matrix = [];

  for (let block = 0; block < numBlocks; block++) {
      let blockRow = [];
      for (let replicate = 0; replicate < numReplicates; replicate++) {
        let randomFormulas = shuffleArray(formulas, numColumn);
        blockRow.push(randomFormulas);
      }
      matrix.push(blockRow);
  }
  return matrix;
}

function createRCDMatrix(numReplicates, numColumn, formulas) {
  let matrix = [];
  
  for (let replicate = 0; replicate < numReplicates; replicate++) {
      let randomFormulas = shuffleRCDArray(formulas, numColumn);
      let replicateRow = [];
      replicateRow.push(randomFormulas.slice());
      matrix.push(replicateRow);
    }
    return matrix;
}

function shuffleArray(arr, numColumn) {
  let array = arr.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice(0, numColumn);
}

function shuffleRCDArray(arr, numColumn) {
  let result = [];
  while (result.length < numColumn) {
    let shuffledArray = shuffleArray(arr, arr.length);
    for (let i = 0; i < shuffledArray.length && result.length < numColumn; i++) {
      result.push(shuffledArray[i]);
    }
  }
  return result;
}

async function saveLayout(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    let layout = data;
    await layoutArrangementModel.deleteMany({ project_id : {$in: [layout.project_id]} },  {session: session});
    await layoutArrangementModel.insertMany(layout,  {session: session});

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
  return data;
}

async function getByProjectId(project_id) {
  return await layoutArrangementModel.findOne({project_id: project_id });
}

module.exports = {
  generateLayout,
  saveLayout,
  getByProjectId
};

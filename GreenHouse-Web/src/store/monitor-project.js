import { defineStore } from 'pinia';
import inputBatchApi from '../api/inputBatch';
import criterionApi from '../api/criterion';
import layoutArrangementApi from '../api/layoutArrangement';
import projectApi from '../api/project';
import projectDetailApi from '../api/projectDetail';
import { ModelState, RoleProject, TypeExperiment } from '../enum/enum';
import criterion from '@/api/criterion';

export const useProjectMonitorStore = defineStore({
  id: 'monitor-project',
  state: () => ({
    mode: null,
    isEditable: null,
    project: null,
    typeExperiment: TypeExperiment.RCBD,
    cellSelected: null,
    start_date: null,
    end_date: null,
    projectId: null,
    inputBatchList: [],
    input_batch: null,
    layoutDetail: [],
    criterionList: [],
  }),
  actions: {
    async getProjectById(id) {
      const res = await projectApi.getById(id);
      this.project = res.project;
      this.userProject = res.userProject;
      this.start_date = res.project.start_date;
      this.end_date = res.project.end_date;
      let userLogin = JSON.parse(localStorage.getItem('user'));
      if(this.userProject.some(x => x.user_id == userLogin._id && x.role != RoleProject.Guest)) {
        this.mode = ModelState.Edit;
        this.isEditable = this.userProject.some(x => x.user_id == userLogin._id && x.role != RoleProject.Guest);
      } else {
        this.mode = ModelState.View;
        this.isEditable = false;
      }
    },
    async getInputBatchByProjectId() {
      var inputBatch = await inputBatchApi.getByProjectId(this.project._id);
      this.inputBatchList = inputBatch.map(element => {
        return {
          _id: element._id,
          order: element.order,
          start_date: new Date(element.start_date),
          end_date: new Date(element.end_date),
          project_id: element.project_id,
          project_code: element.project_code,
        };
      });
    },

    async getCriterionByProjectId() {
      var criterion = await criterionApi.getByProjectId(this.project._id);
      this.criterionList = criterion.map(element => {
        return {
          _id: element._id,
          criterion_code: element.criterion_code,
          criterion_name: element.criterion_name,
          project_id: element.project_id,
          project_code: element.project_code,
        };
      });
    },

    async getlayoutArrangementByProjectId() {
      const res = await layoutArrangementApi.getByProjectId(this.projectId);
      this.layoutDetail = res.layout;
    },

    async saveInputBatch() {
      var project = {
        _id: this.project._id,
        start_date: this.project.start_date,
        end_date: this.project.end_date,
      };
      var inputBatch = this.inputBatchList.map(element => {
        return {
          _id: element._id,
          order: element.order,
          start_date: element.start_date,
          end_date: element.end_date,
          project_id: this.project._id,
          project_code: this.project.project_code,
        };
      });
      let data = {
        project,
        inputBatch,
      };
      await inputBatchApi.createInputBatch(data);
    },

    async getDataByCell() {
      var params = {
        input_batch_id: this.input_batch._id,
        project_id: this.project._id,
        block: this.cellSelected.block,
        replicate: this.cellSelected.replicate,
        column: this.cellSelected.column,
      };
      const res = await projectDetailApi.getDataByCell(params);
      return res;
    },

    async saveDataByCell(projectDetailList) {
      
      const res = await projectDetailApi.saveDataByCell(projectDetailList);
      return res;
    },

    async exportData() {
      const res = await projectDetailApi.exportData(this.projectId);
    },
  },
});
import { defineStore } from 'pinia';
import projectApi from '../api/project';
import authApi from '../api/auth';
import factorApi from '../api/factor';
import treatmentApi from '../api/treatment';
import criterionApi from '../api/criterion';
import layoutArrangementApi from '../api/layoutArrangement';
import { ModelState, TypeExperiment, RoleProject } from '../enum/enum';
import { ObjectId } from 'bson';

export const useProjectDetailStore = defineStore({
  id: 'project-detail',
  state: () => ({
    mode: null,
    isEditable: null,
    project: null,
    projectId: null,
    typeExperiment: TypeExperiment.RCBD,
    userProject: [],
    members: [],
    factorList: [],
    levelList: [],
    treatmentList: [],
    criterionList: [],
    layoutArrangement: [],
  }),
  actions: {
    async getById(id) {
      const res = await projectApi.getById(id);
      const user = await authApi.getAllUser();
      this.projectId = id;
      this.project = res.project;
      this.typeExperiment = this.project.type_experiment;
      this.userProject = res.userProject;
      this.members = user.map(x => ({
        _id: x._id,
        email: x.email,
        full_name: x.full_name,
        role: x.role,
        name_email: `${x.full_name} (${x.email})`
      }));
      let userLogin = JSON.parse(localStorage.getItem('user'));
      if(this.userProject.some(x => x.user_id == userLogin._id && x.role != RoleProject.Guest)) {
        this.mode = ModelState.Edit;
        this.isEditable = this.userProject.some(x => x.user_id == userLogin._id && x.role != RoleProject.Guest);
      } else {
        this.mode = ModelState.View;
      }
    },

    async checkEditabled(id) {
      const res = await projectApi.getById(id);
      let userProject = res.userProject;
      let isEdit = false;
      let userLogin = JSON.parse(localStorage.getItem('user'));
      if(userProject.some(x => x.user_id == userLogin._id && x.role != 2)) {
        isEdit = true;
      }
      return isEdit;
    },

    async generateCode() {
      let userLogin = JSON.parse(localStorage.getItem('user'));
      return await projectApi.generateCode(userLogin._id);
    },

    async getFactorLevelByProjectId() {
      const res = await factorApi.getByProjectId(this.projectId);
      this.factorList = res.factor;
      this.levelList = res.level;
    },

    async getTreatmentByProjectId() {
      this.treatmentList = await treatmentApi.getByProjectId(this.projectId);
    },

    async getCriterionByProjectId() {
      this.criterionList = await criterionApi.getByProjectId(this.projectId);
    },

    async getlayoutArrangementByProjectId() {
      this.layoutArrangement = await layoutArrangementApi.getByProjectId(this.projectId);
    },

    async generateLayout(layoutParams) {
      return await layoutArrangementApi.generateLayout(layoutParams);
    },

    async createProject() {
      await this.createProjectSummary();
      await this.createFactor();
      await this.createTreatment();
      await this.createCriterion();
      await this.createLayout();
    },

    async createProjectSummary() {
      this.userProject = this.userProject.map(item => {
        let user = this.members.find(x => x._id == item.user_id);
        return {
          user_id: item.user_id,
          role: item.role,
          email: user.email,
          full_name: user.full_name,
          project_id: this.projectId,
          project_code: this.project?.project_code,
        }
      });
      let userLogin = JSON.parse(localStorage.getItem('user'));
      this.project = { ...this.project, owner: userLogin._id, owner_name: userLogin.full_name, _id: this.projectId};
      let projectData = {
        project: this.project,
        userProject: this.userProject,
      };
      await projectApi.createProject(projectData);
    },

    async createFactor() {
      let newFactor = this.factorList.map(item => {
        return {
          _id: new ObjectId(),
          factor_code: item.factor_code,
          factor_name: item.factor_name,
          project_id: this.projectId,
          project_code: this.project.project_code,
        }
      });
      let levelData = this.levelList.map(item => {
        return {
          level_code: item.level_code,
          level_name: item.level_name,
          factor_id: newFactor[0]._id,
          factor_code: newFactor[0].factor_code,
        }
      });
      let factorData = {
        factor: newFactor,
        level: levelData,
      };
      await factorApi.createFactor(factorData);
    },

    async createTreatment() {
      await treatmentApi.createTreatment(this.treatmentList);
    },

    async createCriterion() {
      let criterionData = this.criterionList.map(item => {
        return {
          criterion_code: item.criterion_code,
          criterion_name: item.criterion_name,
          project_id: this.projectId,
          project_code: this.project.project_code,
        }
      });
      await criterionApi.createCriterion(criterionData);
    },

    async createLayout() {
      let layoutData = {
          _id: this.layoutArrangement._id,
          project_id: this.projectId,
          project_code: this.project.project_code,
          block: this.layoutArrangement.block,
          replicate: this.layoutArrangement.replicate,
          column: this.layoutArrangement.column,
          treatments: this.layoutArrangement.treatments,
          layout: this.layoutArrangement.layout,
        }
      await layoutArrangementApi.createLayout(layoutData);
    },

    async editProject() {
      await this.updateProjectSummary();
      await this.updateFactor();
      await this.updateTreatment();
      await this.updateCriterion();
      await this.updateLayout();
    },

    async updateProjectSummary() {
      this.userProject = this.userProject.map(item => {
        let user = this.members.find(x => x._id == item.user_id);
        return {
          _id: item._id,
          user_id: item.user_id,
          role: item.role,
          email: user.email,
          full_name: user.full_name,
          project_id: this.projectId,
          project_code: this.project?.project_code,
        }
      });
      let userLogin = JSON.parse(localStorage.getItem('user'));
      this.project = { ...this.project, owner: userLogin._id, owner_name: userLogin.full_name, _id: this.projectId};
      let projectData = {
        project: this.project,
        userProject: this.userProject,
      };
      await projectApi.updateProject(projectData);
    },

    async updateFactor() {
      let newFactor = this.factorList.map(item => {
        return {
          _id: item._id,
          factor_code: item.factor_code,
          factor_name: item.factor_name,
          project_id: this.projectId,
          project_code: this.project.project_code,
        }
      });
      let levelData = this.levelList.map(item => {
        return {
          _id: item._id,
          level_code: item.level_code,
          level_name: item.level_name,
          factor_id: newFactor[0]._id,
          factor_code: newFactor[0].factor_code,
        }
      });
      let factorData = {
        factor: newFactor,
        level: levelData,
      };
      await factorApi.updateFactor(factorData);
    },

    async updateTreatment() {
      let newTreatment = this.treatmentList.map(item => {
        return {
          _id: item._id,
          treatment_code: item.treatment_code,
          treatment_name: item.treatment_name,
          project_id: this.projectId,
          project_code: this.project.project_code,
          components: item.components,
        }
      });
      await treatmentApi.updateTreatment(newTreatment);
    },

    async updateCriterion() {
      let criterionData = this.criterionList.map(item => {
        return {
          _id: item._id,
          criterion_code: item.criterion_code,
          criterion_name: item.criterion_name,
          project_id: this.projectId,
          project_code: this.project.project_code,
        }
      });
      await criterionApi.updateCriterion(criterionData);
    },

    async updateLayout() {
      let layoutData = {
          _id: this.layoutArrangement._id,
          project_id: this.projectId,
          project_code: this.project.project_code,
          block: this.layoutArrangement.block,
          column: this.layoutArrangement.column,
          replicate: this.layoutArrangement.replicate,
          treatments: this.layoutArrangement.treatments,
          layout: this.layoutArrangement.layout,
        }
      await layoutArrangementApi.createLayout(layoutData);
    },
  },
});
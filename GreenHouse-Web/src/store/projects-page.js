import { defineStore } from 'pinia';
import projectApi from '../api/project';

export const useProjectStore = defineStore({
  id: 'project-page',
  state: () => ({
    projectList: [],
    currentPage: 1,
    limit: 10,
  }),
  actions: {
    async getPagingProjects(page = this.currentPage, limit = this.limit) {
      const res = await projectApi.getPaging(page, limit);
      this.projectList = res.data.projects;
      this.currentPage = page;
      this.limit = limit;
    },
    async deleteProject(projectId) {
      await projectApi.deleteProject(projectId);
      this.projectList = [...this.projectList.filter(x => x._id !== projectId)];
    },
  },
});
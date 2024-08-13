import { defineStore } from 'pinia';
import authApi from '../api/auth';

export const useUserStore = defineStore({
  id: 'user-page',
  state: () => ({
    userList: [],
    currentPage: 1,
    limit: 10,
    mode: null,
    userDetail: null,
    userId: null,
  }),
  actions: {
    async getPagingUsers(page = this.currentPage, limit = this.limit) {
      const res = await authApi.getPaging(page, limit);
      this.userList = res.data.users;
      this.currentPage = page;
      this.limit = limit;
    },
    async saveUser() {
      const formData = {
        _id: this.userId,
        email: this.userDetail.email,
        full_name: this.userDetail.full_name,
        role: this.userDetail.role
      };
      if(this.mode == 0) {
        await authApi.createAccount(formData);
      } else {
        await authApi.updateUser(formData);
      }
    },
    async deleteUser(userId) {
      await authApi.deleteUser(userId);
      this.userList = [...this.userList.filter(x => x._id !== userId)];
    },
  },
});
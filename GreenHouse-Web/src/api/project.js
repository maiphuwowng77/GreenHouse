import axios from 'axios';

export default {
  async getPaging(page, limit) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8083/api/project/paging?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      if (res.status == 200) {
        return {
          data: res.data,
        };
      }
    }
    catch {
      return {
        isOk: false,
        message: "Failed to create account"
      };
    }
  },

  async deleteProject(projectId) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:8083/api/project/?id=${projectId}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      if (res.status == 200) {
        return true;
      }
      return false;
    }
    catch {
      return false;
    }
  },

  async getById(projectId) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8083/api/project/getById?id=${projectId}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      if (res.status == 200) {
        return res.data;
      }
      return false;
    }
    catch {
      return false;
    }
  },

  async generateCode(userId) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8083/api/project/generateCode?userId=${userId}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      if (res.status == 200) {
        return res.data;
      }
      return false;
    }
    catch {
      return false;
    }
  },

  async createProject(projectData) {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(`http://localhost:8083/api/project/`, 
        projectData, 
        {
          headers: {
            'Authorization': `${token}`
        }
      });
      if (res.status == 201) {
        return true;
      }
      return false;
    }
    catch {
      return false;
    }
  },

  async updateProject(projectData) {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.put(`http://localhost:8083/api/project/`, 
        projectData, 
        {
          headers: {
            'Authorization': `${token}`
        }
      });
      if (res.status == 200) {
        return true;
      }
      return false;
    }
    catch {
      return false;
    }
  },

};
import axios from 'axios';

export default {

  async getByProjectId(projectId) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://112.137.129.158:8083/api/criterion/?project_id=${projectId}`, {
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

  async createCriterion(data) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://112.137.129.158:8083/api/criterion/`, 
      {
        data
      },
      {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.status == 201) {
        return res.data;
      }
      return false;
    }
    catch {
      return false;
    }
  },

  async updateCriterion(updateData) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://112.137.129.158:8083/api/criterion/`, 
      {
        updateData
      },
      {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
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

};
import axios from 'axios';

export default {

  async getByProjectId(projectId) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8083/api/inputBatch/?project_id=${projectId}`, {
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

  async createInputBatch(data) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:8083/api/inputBatch/`, 
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

};
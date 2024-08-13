import axios from 'axios';

export default {
  async checkDeleteProject(projectId) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://112.137.129.158:8083/api/projectDetail/checkDeleteProject?projectId=${projectId}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      if (res.status == 200) {
        return res.data;
      }
    }
    catch {
      return false;
    }
  },

  async getDataByCell(params) {
    try {
      const { input_batch_id, project_id, block, replicate, column } = params;
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://112.137.129.158:8083/api/projectDetail/?input_batch_id=${input_batch_id}&project_id=${project_id}&block=${block}&replicate=${replicate}&column=${column}`, {
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

  async saveDataByCell(updateData) {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user')).email;
      const res = await axios.put(`http://112.137.129.158:8083/api/projectDetail/?userId=${user}`, 
      updateData, 
      {
        headers: {
          'Authorization': `${token}`
        }
      });
      if (res.status == 200) {
        console.log(user);
        return res.data;
      }
      return false;
    }
    catch {
      return false;
    }
  },

  async exportData(projectId) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://112.137.129.158:8083/api/projectDetail/export?projectId=${projectId}`, {
        headers: {
          'Authorization': `${token}`
        },
        responseType: 'blob',
      });
      if (res.status == 200) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Export.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } 
    catch {
      return false;
    }
  },

};
import axios from 'axios';
import * as jwtDecode from 'jwt-decode';
const defaultUser = {
  email: '',
  
};

export default {
  _user: defaultUser,
  loggedIn() {
    let token = localStorage.getItem('token');
    if(!token) return false;

    let decoded = jwtDecode.jwtDecode(token);
    localStorage.setItem('user', JSON.stringify(decoded.user));
    let current_time = Date.now().valueOf() / 1000;
    if (decoded.exp < current_time) {
      return false;
    }

    return true;
  },

  async logIn(email, password) {
    try {
      const res = await axios.post('http://112.137.129.158:8083/api/auth/login', {
        email: email,
        password: password
      });
  
      if (res.status !== 200) {
        throw new Error(`HTTP error! status: ${res.status}`);
      } else {
        localStorage.setItem('token', res.data.token);
        this._user = { email };

        return {
          isOk: true,
          data: res.data
        };
      }
    }
    catch (error) {
      console.log(error);
      return {
        isOk: false,
        message: error.response.data.message
      };
    }
  },

  async logOut() {
    this._user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getUser() {
    let user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return defaultUser;
  },

  async createAccount(formData) {
    try {
      await axios.post('http://112.137.129.158:8083/api/auth/signup', {
        _id: formData._id,
        email: formData.email,
        password: '12345678',
        full_name: formData.full_name,
        role: formData.role
      });

      return {
        isOk: true,
      };
    }
    catch (error){
      return {
        isOk: false,
        message: error.response.data.message
      };
    }
  },

  async getAllUser() {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://112.137.129.158:8083/api/user/', {
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

  async getPaging(page, limit) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://112.137.129.158:8083/api/auth/paging?page=${page}&limit=${limit}`, {
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

  async updateUser(data) {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.put(`http://112.137.129.158:8083/api/auth/`, 
      data, 
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

  async deleteUser(userId) {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://112.137.129.158:8083/api/auth/?id=${userId}`, {
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
  async changePassword(currentPassword, newPassword) {
    try {
      const token = localStorage.getItem('token');
      const userEmail = JSON.parse(localStorage.getItem('user')).email;
      console.log(userEmail);
      const res = await axios.put('http://112.137.129.158:8083/api/auth/change-password', {
        email: userEmail,
        currentPassword: currentPassword,
        newPassword: newPassword
      }, {
        headers: {
          'Authorization': `${token}`
        }
      });
  
      if (res.status !== 200) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      return {
        isOk: true,
        message: "Password changed successfully!"
      };
    } catch (error) {
      console.error('Change password error:', error);
      let errorMessage = error.response.data.message || "Failed to change password";
  
      // Kiểm tra nếu lỗi là mật khẩu hiện tại không đúng
      if (error.response.status === 401 && error.response.data.error === 'Current password is incorrect') {
        errorMessage = "Current password is incorrect. Please enter the correct current password.";
      }
  
      return {
        isOk: false,
        message: errorMessage
      };
    }
  },  
};

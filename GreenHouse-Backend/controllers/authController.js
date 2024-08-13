const authService = require('../services/authService');

// đăng nhập
async function login(req, res) {
  try {
    const token = await authService.login(req.body);
    console.log(token);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

// Đăng xuất
function logout(req, res) {
  res.clearCookie('token');
  res.status(200).json({ message: 'Signed out' });
}

// đăng ký
async function signup(req, res) {
  try {
    const item = await authService.signup(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

// Thay đổi mật khẩu
async function changePassword(req, res) {
  try {
    await authService.changePassword(req.body);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
}


async function getPaging(req, res) {
  try {
    const data = await authService.getPaging(req.query);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function editUser(req, res) {
  try {
    const data = await authService.editUser(req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function deleteUser(req, res) {
  try {
    await authService.deleteUser(req.query.id);
    res.status(200).json(true);
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = {
  login,
  logout,
  signup,
  changePassword,
  getPaging,
  editUser,
  deleteUser
};

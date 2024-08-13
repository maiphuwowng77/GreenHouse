const userService = require('../services/userService');

async function getAllUser(req, res) {
  try {
    const users = await userService.getAllUser();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function getPaging(req, res) {
  try {
    const user = await userService.getPaging(req.query);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function addUser(req, res) {
  try {
    await userService.addUser(req.body);
    res.status(201);
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = {
  getAllUser,
  getPaging,
  addUser
};

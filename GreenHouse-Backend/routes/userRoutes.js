const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, userController.getAllUser);
router.get('/getPaging', authMiddleware, userController.getPaging);
router.post('/', authMiddleware, userController.addUser);

module.exports = router;

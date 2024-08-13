const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/signup', authController.signup);
router.put('/change-password', authMiddleware, authController.changePassword); // Thêm đường dẫn '/changepassword' cho thay đổi mật khẩu
router.put('/', authController.editUser);
router.delete('/', authController.deleteUser);
router.get('/paging', authMiddleware, authController.getPaging);

module.exports = router;

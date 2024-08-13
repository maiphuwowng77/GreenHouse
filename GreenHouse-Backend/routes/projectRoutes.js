const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/paging', authMiddleware, projectController.getPaging);
router.get('/getById', authMiddleware, projectController.getById);
router.post('/', authMiddleware, projectController.createProject);
router.put('/', authMiddleware, projectController.updateProject);
router.delete('/', authMiddleware, projectController.deleteProject);
router.get('/generateCode', authMiddleware, projectController.generateCode);

module.exports = router;

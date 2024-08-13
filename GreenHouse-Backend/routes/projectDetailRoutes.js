const express = require('express');
const router = express.Router();
const projectDetailController = require('../controllers/projectDetailController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, projectDetailController.getDataByCell);
router.get('/getInputBatch', authMiddleware, projectDetailController.getDataByInputBatch);
router.post('/', authMiddleware, projectDetailController.create);
router.put('/', authMiddleware, projectDetailController.update);
// router.delete('/', authMiddleware, projectDetailController.deleteById);
router.get('/checkDeleteProject', authMiddleware, projectDetailController.checkDeleteProject);
router.get('/export', authMiddleware, projectDetailController.exportData);

module.exports = router;

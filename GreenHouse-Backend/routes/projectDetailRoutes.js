const express = require('express');
const router = express.Router();
const projectDetailController = require('../controllers/projectDetailController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Lưu file trong bộ nhớ tạm thời

router.put('/import', authMiddleware, upload.single('file'), projectDetailController.importData);
router.get('/', authMiddleware, projectDetailController.getDataByCell);
router.get('/getInputBatch', authMiddleware, projectDetailController.getDataByInputBatch);
router.get('/getHistory', authMiddleware, projectDetailController.getHistoryByCell);
router.post('/', authMiddleware, projectDetailController.create);
router.put('/', authMiddleware, projectDetailController.update);
// router.delete('/', authMiddleware, projectDetailController.deleteById);
router.get('/checkDeleteProject', authMiddleware, projectDetailController.checkDeleteProject);
router.get('/export', authMiddleware, projectDetailController.exportData);
router.get('/exportSchema', authMiddleware, projectDetailController.exportSchema);
router.get('/exportHistory', authMiddleware, projectDetailController.exportHistoryData);

module.exports = router;

const express = require('express');
const router = express.Router();
const layoutArrangementController = require('../controllers/layoutArrangementController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generateLayout', authMiddleware, layoutArrangementController.generateLayout);
router.post('/saveLayout', authMiddleware, layoutArrangementController.saveLayout);
router.get('/', authMiddleware, layoutArrangementController.getByProjectId);

module.exports = router;

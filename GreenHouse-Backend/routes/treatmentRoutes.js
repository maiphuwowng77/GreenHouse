const express = require('express');
const router = express.Router();
const treatmentController = require('../controllers/treatmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, treatmentController.getByProjectId);
router.post('/', authMiddleware, treatmentController.create);
router.put('/', authMiddleware, treatmentController.update);
// router.delete('/', authMiddleware, treatmentController.deleteById);

module.exports = router;

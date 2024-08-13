const express = require('express');
const router = express.Router();
const inputBatchController = require('../controllers/inputBatchController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, inputBatchController.getByProjectId);
router.post('/', authMiddleware, inputBatchController.create);
// router.put('/', authMiddleware, inputBatchController.update);
// router.delete('/', authMiddleware, inputBatchController.deleteById);

module.exports = router;

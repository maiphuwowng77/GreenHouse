const express = require('express');
const router = express.Router();
const criterionController = require('../controllers/criterionController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, criterionController.getByProjectId);
router.post('/', authMiddleware, criterionController.create);
router.put('/', authMiddleware, criterionController.update);
// router.delete('/', authMiddleware, criterionController.deleteById);

module.exports = router;

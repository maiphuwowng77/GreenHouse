const express = require('express');
const router = express.Router();
const factorController = require('../controllers/factorController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, factorController.getByProjectId);
router.post('/', authMiddleware, factorController.create);
router.put('/', authMiddleware, factorController.update);
// router.delete('/', authMiddleware, factorController.deleteByProjectId);
// router.get('/level', authMiddleware, factorController.getLevelByFactorId);

module.exports = router;

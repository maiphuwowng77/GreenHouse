const express = require('express');
const router = express.Router();

// Import các routes con
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const criterionRoutes = require('./criterionRoutes');
const treatmentRoutes = require('./treatmentRoutes');
const factorRoutes = require('./factorRoutes');
const projectDetailRoutes = require('./projectDetailRoutes');
const layoutArrangementRoutes = require('./layoutArrangementRoutes');
const inputBatchRoutes = require('./inputBatchRoutes');

// Sử dụng các routes con
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/criterion', criterionRoutes);
router.use('/factor', factorRoutes);
router.use('/treatment', treatmentRoutes);
router.use('/projectDetail', projectDetailRoutes);
router.use('/project', projectRoutes);
router.use('/layoutArrangement', layoutArrangementRoutes);
router.use('/inputBatch', inputBatchRoutes);

module.exports = router;

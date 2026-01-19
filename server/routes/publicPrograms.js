const express = require('express');
const router = express.Router();
const publicProgramController = require('../controllers/publicProgramController');

router.get('/:token', publicProgramController.getPublicProgram);

module.exports = router;

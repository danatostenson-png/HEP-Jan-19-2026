const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const auth = require('../middleware/auth');

router.get('/', auth, programController.getPrograms);
router.get('/:id', auth, programController.getProgram);
router.post('/', auth, programController.createProgram);
router.put('/:id', auth, programController.updateProgram);
router.post('/:id/email', auth, programController.sendProgramEmail);

module.exports = router;

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/auth');

router.get('/', auth, patientController.getPatients);
router.post('/', auth, patientController.createPatient);
router.delete('/:id', auth, patientController.deletePatient);
router.get('/:id', auth, patientController.getPatientById);
router.put('/:id', auth, patientController.updatePatient);

module.exports = router;

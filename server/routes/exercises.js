const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const auth = require('../middleware/auth');
const multer = require('multer');
const importController = require('../controllers/importController');
const path = require('path');

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // unique filename
    }
});
const upload = multer({ storage });

// Public read access for library (or authenticated, choice depends on constraints)
// Let's make it authenticated to be safe
// Basic CRUD
router.get('/', auth, exerciseController.searchExercises);
router.get('/:id', auth, exerciseController.getExerciseById);
router.post('/', auth, upload.single('image'), exerciseController.createCustomExercise);
router.put('/:id', auth, exerciseController.updateExercise);
router.delete('/:id', auth, exerciseController.deleteExercise);

// Special Actions
router.post('/express-import', auth, importController.processExpressImport);
router.post('/analyze-photo', auth, upload.single('image'), exerciseController.analyzePhoto);
router.post('/:id/favorite', auth, exerciseController.toggleFavorite);

module.exports = router;

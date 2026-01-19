const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const auth = require('../middleware/auth');
const multer = require('multer');
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
router.get('/', auth, exerciseController.searchExercises);
router.post('/', auth, upload.single('image'), exerciseController.createCustomExercise);
router.post('/analyze-photo', auth, upload.single('image'), exerciseController.analyzePhoto);
router.post('/:id/favorite', auth, exerciseController.toggleFavorite);

module.exports = router;

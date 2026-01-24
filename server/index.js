require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const prisma = require('./lib/prisma');
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Basic Health Check
app.get('/', (req, res) => {
    res.send('ExerciseRx API is running');
});

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const exerciseRoutes = require('./routes/exercises');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/users', require('./routes/users'));
app.use('/api/programs', require('./routes/programs'));
app.use('/api/public/programs', require('./routes/publicPrograms'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = { app, prisma };

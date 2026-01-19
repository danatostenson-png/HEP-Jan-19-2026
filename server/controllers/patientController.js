const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all patients for the authenticated user
exports.getPatients = async (req, res) => {
    try {
        const patients = await prisma.patient.findMany({
            where: { userId: req.user.userId },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
};

// Create a new patient
exports.createPatient = async (req, res) => {
    try {
        const { name, email, diagnosis } = req.body;
        const patient = await prisma.patient.create({
            data: {
                name,
                email,
                diagnosis,
                userId: req.user.userId
            }
        });
        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create patient' });
    }
};

// Delete a patient
exports.deletePatient = async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure the patient belongs to the user
        const patient = await prisma.patient.findUnique({
            where: { id }
        });

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        if (patient.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await prisma.patient.delete({
            where: { id }
        });

        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete patient' });
    }
};

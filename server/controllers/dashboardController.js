const prisma = require('../lib/prisma');


exports.getStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [patientCount, programCount, sentCount] = await prisma.$transaction([
            prisma.patient.count({ where: { userId } }),
            prisma.program.count({ where: { userId } }),
            prisma.program.count({ where: { userId, status: 'SENT' } })
        ]);

        res.json({
            patients: patientCount,
            programs: programCount,
            activePrograms: sentCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

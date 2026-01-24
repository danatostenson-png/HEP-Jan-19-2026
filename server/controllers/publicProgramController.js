const prisma = require('../lib/prisma');


// Get program by share token (Public access)
exports.getPublicProgram = async (req, res) => {
    try {
        const { token } = req.params;

        const program = await prisma.program.findUnique({
            where: { shareToken: token },
            include: {
                patient: {
                    select: { name: true }
                },
                user: {
                    select: { name: true, clinicName: true, logoUrl: true }
                },
                exercises: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }

        res.json(program);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch program' });
    }
};

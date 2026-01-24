const prisma = require('../lib/prisma');


// Get current user profile
exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                clinicName: true,
                logoUrl: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Update user profile
exports.updateMe = async (req, res) => {
    try {
        const { name, clinicName, logoUrl } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                name,
                clinicName,
                logoUrl
            },
            select: {
                id: true,
                email: true,
                name: true,
                clinicName: true,
                logoUrl: true
            }
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

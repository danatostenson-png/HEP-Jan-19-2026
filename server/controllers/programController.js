const prisma = require('../lib/prisma');


// Create a new program
exports.createProgram = async (req, res) => {
    try {
        const { title, patientId, exercises, status } = req.body; // exercises is an array of objects

        if (!patientId) {
            return res.status(400).json({ error: 'Patient is required' });
        }

        const program = await prisma.program.create({
            data: {
                title: title || 'Untitled Program',
                status: status || 'DRAFT',
                userId: req.user.userId,
                patientId,
                exercises: {
                    create: exercises.map(ex => ({
                        exerciseId: ex.exerciseId, // Optional link to library
                        title: ex.title,
                        imageUrl: ex.imageUrl,
                        description: ex.description,
                        sets: ex.sets,
                        reps: ex.reps,
                        frequency: ex.frequency,
                        weight: ex.weight,
                        notes: ex.notes,
                        order: ex.order || 0
                    }))
                }
            },
            include: {
                exercises: true
            }
        });

        res.status(201).json(program);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create program' });
    }
};

// Get all programs for the user
exports.getPrograms = async (req, res) => {
    try {
        const programs = await prisma.program.findMany({
            where: { userId: req.user.userId },
            include: {
                patient: {
                    select: { name: true, email: true }
                },
                _count: {
                    select: { exercises: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(programs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch programs' });
    }
};

// Get a single program by ID
exports.getProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const program = await prisma.program.findUnique({
            where: { id },
            include: {
                patient: true,
                exercises: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!program) return res.status(404).json({ error: 'Program not found' });
        if (program.userId !== req.user.userId) return res.status(403).json({ error: 'Unauthorized' });

        res.json(program);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch program' });
    }
};

// Update a program (Status or Content)
exports.updateProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, status, exercises } = req.body;

        const program = await prisma.program.findUnique({ where: { id } });
        if (!program) return res.status(404).json({ error: 'Program not found' });
        if (program.userId !== req.user.userId) return res.status(403).json({ error: 'Unauthorized' });

        // If exercises are provided, we replace them (transactional)
        if (exercises) {
            await prisma.$transaction([
                prisma.programExercise.deleteMany({ where: { programId: id } }),
                prisma.program.update({
                    where: { id },
                    data: {
                        title,
                        status,
                        exercises: {
                            create: exercises.map(ex => ({
                                exerciseId: ex.exerciseId,
                                title: ex.title,
                                imageUrl: ex.imageUrl,
                                description: ex.description,
                                sets: ex.sets,
                                reps: ex.reps,
                                frequency: ex.frequency,
                                weight: ex.weight,
                                notes: ex.notes,
                                order: ex.order || 0
                            }))
                        }
                    }
                })
            ]);

            // Fetch updated
            const updated = await prisma.program.findUnique({
                where: { id },
                include: { exercises: true, patient: true }
            });
            return res.json(updated);
        } else {
            // Just update metadata
            const updated = await prisma.program.update({
                where: { id },
                data: { title, status }
            });
            return res.json(updated);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update program' });
    }
};

const emailService = require('../services/emailService');

// Send Program via Email
exports.sendProgramEmail = async (req, res) => {
    try {
        const { id } = req.params;

        const program = await prisma.program.findUnique({
            where: { id },
            include: {
                patient: true,
                user: true
            }
        });

        if (!program) return res.status(404).json({ error: 'Program not found' });
        if (program.userId !== req.user.userId) return res.status(403).json({ error: 'Unauthorized' });

        const publicLink = `http://localhost:3001/p/${program.shareToken}`; // Use env var for host in real app

        await emailService.sendEmail({
            to: program.patient.email,
            subject: `New Exercise Program from ${program.user.clinicName || program.user.name}`,
            text: `Hi ${program.patient.name}, here is your new exercise program: ${publicLink}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>New Exercise Program</h2>
                    <p>Hi <strong>${program.patient.name}</strong>,</p>
                    <p>${program.user.clinicName || program.user.name} has assigned you a new home exercise program.</p>
                    <p>Click the link below to view it:</p>
                    <a href="${publicLink}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">View Program</a>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">Link: ${publicLink}</p>
                </div>
            `
        });

        // Update status to SENT
        const updated = await prisma.program.update({
            where: { id },
            data: { status: 'SENT' }
        });

        res.json({ message: 'Email sent successfully', program: updated });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send email' });
    }
};

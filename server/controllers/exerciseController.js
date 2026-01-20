const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Search exercises
exports.searchExercises = async (req, res) => {
    try {
        const { query, bodyPart, favoritesOnly } = req.query;

        let where = {};

        if (query) {
            where.OR = [
                { title: { contains: query } },
                { tags: { contains: query } }
            ];
        }

        if (bodyPart && bodyPart !== 'All') {
            where.bodyPart = bodyPart;
        }

        if (favoritesOnly === 'true') {
            where.favoritedBy = {
                some: { userId: req.user.userId }
            };
        }

        const exercises = await prisma.exercise.findMany({
            where,
            take: 50, // Increased limit for better ux
            include: {
                favoritedBy: {
                    where: { userId: req.user.userId }
                }
            }
        });

        // Transform to flat object
        const results = exercises.map(ex => ({
            ...ex,
            isFavorite: ex.favoritedBy.length > 0,
            favoritedBy: undefined // cleanup
        }));

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to search exercises' });
    }
};

// Toggle Favorite Status
exports.toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const existing = await prisma.favorite.findUnique({
            where: {
                userId_exerciseId: {
                    userId,
                    exerciseId: id
                }
            }
        });

        if (existing) {
            await prisma.favorite.delete({
                where: { id: existing.id }
            });
            res.json({ isFavorite: false });
        } else {
            await prisma.favorite.create({
                data: {
                    userId,
                    exerciseId: id
                }
            });
            res.json({ isFavorite: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
};

// Create Custom Exercise
exports.createCustomExercise = async (req, res) => {
    try {
        const {
            title,
            description,
            imageUrl,
            bodyPart,
            parsedFromExpressImport,
            globalCadenceApplied,
            autoExercisePlanId
        } = req.body;

        let finalImageUrl = imageUrl;
        let imageSource = 'library_url';

        if (req.file) {
            // If file provided, use local path
            finalImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            imageSource = 'local_upload';
        }

        const exercise = await prisma.exercise.create({
            data: {
                title,
                description,
                imageUrl: finalImageUrl,
                bodyPart,
                isCustom: true,
                imageSource,
                // Save AI/Analysis metadata if provided
                autoDescription: req.body.autoDescription || null,
                analysisSource: req.body.analysisSource || 'manual',
                nameAnchorUsed: req.body.nameAnchorUsed === 'true' || req.body.nameAnchorUsed === true,
                // Express Import Tags
                parsedFromExpressImport: parsedFromExpressImport === 'true' || parsedFromExpressImport === true,
                globalCadenceApplied: globalCadenceApplied === 'true' || globalCadenceApplied === true,
                autoExercisePlanId: autoExercisePlanId || null,
            }
        });

        res.status(201).json(exercise);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
};

// Mock Analyze Photo
exports.analyzePhoto = async (req, res) => {
    try {
        const { anchorName } = req.body;
        // req.file would exist if we were processing the image for real analysis

        let description = "1. Start in a neutral position.\n2. Perform the movement with control.\n3. Return to the starting position.";
        let nameAnchorUsed = false;

        // Heuristic Mock Analysis
        if (anchorName) {
            const lowerName = anchorName.toLowerCase();
            if (lowerName.includes('squat')) {
                description = "1. Stand with feet shoulder-width apart.\n2. Lower hips back and down as if sitting in a chair, keeping chest up.\n3. Return to standing by driving through heels.";
                nameAnchorUsed = true;
            } else if (lowerName.includes('plank')) {
                description = "1. Start in a push-up position on forearms.\n2. Keep body in a straight line from head to heels.\n3. Hold for the designated time, engaging core.";
                nameAnchorUsed = true;
            } else if (lowerName.includes('stretch')) {
                description = "1. Move slowly into the stretch position until mild tension is felt.\n2. Hold for 30 seconds without bouncing.\n3. Release and repeat.";
                nameAnchorUsed = true;
            } else if (lowerName.includes('raise') || lowerName.includes('abduction')) {
                description = "1. Stand or sit with good posture.\n2. Raise the limb slowly to the target range.\n3. Lower with control.";
                nameAnchorUsed = true;
            }
        }

        setTimeout(() => {
            res.json({
                description,
                analysisSource: 'photo',
                nameAnchorUsed
            });
        }, 1500); // Simulate network/processing delay

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to analyze photo' });
    }
};

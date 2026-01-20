const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Search exercises (with overrides and hidden checks)
exports.searchExercises = async (req, res) => {
    try {
        const { query, bodyPart, favoritesOnly } = req.query;
        const userId = req.user.userId;

        let where = {
            // Exclude exercises hidden by this user
            hiddenBy: {
                none: { userId }
            }
        };

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
                some: { userId }
            };
        }

        const exercises = await prisma.exercise.findMany({
            where,
            take: 50,
            include: {
                favoritedBy: {
                    where: { userId }
                },
                overrides: {
                    where: { userId }
                }
            }
        });

        // Transform: Merge overrides and flat favorites
        const results = exercises.map(ex => {
            const override = ex.overrides[0]; // Can only have one per user due to unique constraint

            return {
                ...ex,
                // Apply Override if exists
                title: override?.title || ex.title,
                description: override?.description || ex.description,
                imageUrl: override?.imageUrl || ex.imageUrl,
                videoUrl: override?.videoUrl || ex.videoUrl,
                bodyPart: override?.bodyPart || ex.bodyPart,

                isFavorite: ex.favoritedBy.length > 0,

                // Frontend Helpers
                isOverridden: !!override,
                originalTitle: ex.title, // In case UI wants to show "Original: X"

                // Cleanup
                favoritedBy: undefined,
                overrides: undefined
            };
        });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to search exercises' });
    }
};

// Get single exercise by ID (with overrides)
exports.getExerciseById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const exercise = await prisma.exercise.findUnique({
            where: { id },
            include: {
                favoritedBy: { where: { userId } },
                overrides: { where: { userId } }
            }
        });

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        const override = exercise.overrides[0];

        const result = {
            ...exercise,
            title: override?.title || exercise.title,
            description: override?.description || exercise.description,
            imageUrl: override?.imageUrl || exercise.imageUrl,
            videoUrl: override?.videoUrl || exercise.videoUrl,
            bodyPart: override?.bodyPart || exercise.bodyPart,
            isFavorite: exercise.favoritedBy.length > 0,
            isOverridden: !!override,
            favoritedBy: undefined,
            overrides: undefined
        };

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch exercise' });
    }
};

// Update Exercise (Override if Global, Direct if Custom)
exports.updateExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { title, description, bodyPart, imageUrl, videoUrl } = req.body;

        const exercise = await prisma.exercise.findUnique({ where: { id } });

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        // 1. If Custom AND Owned by User -> Update directly
        // Note: Currently existing custom exercises might have null userId. 
        // We assume if isCustom=true and (userId matches OR userId is null implied global custom? No, global custom is rare).
        // Let's stick to the secure check:
        if (exercise.isCustom && exercise.userId === userId) {
            const updated = await prisma.exercise.update({
                where: { id },
                data: { title, description, bodyPart, imageUrl, videoUrl }
            });
            return res.json(updated);
        }

        // 2. Otherwise (Global or someone else's custom) -> Upsert Override
        const override = await prisma.exerciseOverride.upsert({
            where: {
                userId_exerciseId: { userId, exerciseId: id }
            },
            create: {
                userId,
                exerciseId: id,
                title,
                description,
                bodyPart,
                imageUrl,
                videoUrl
            },
            update: {
                title,
                description,
                bodyPart,
                imageUrl,
                videoUrl
            }
        });

        res.json({ ...exercise, ...override, isOverridden: true }); // Merge for response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
};

// Delete Exercise (Hide if Global, Delete if Custom Owner)
exports.deleteExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const exercise = await prisma.exercise.findUnique({ where: { id } });

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        // 1. If Custom AND Owned by User -> Permenant Delete
        if (exercise.isCustom && exercise.userId === userId) {
            // Check usage constraints? e.g. in Programs? 
            // SQLite cascades might handle it, or we need to be careful.
            // For now, per requirements: "Permanently deleted"
            await prisma.exercise.delete({ where: { id } });
            return res.json({ message: 'Exercise permanently deleted', type: 'DATA_DELETED' });
        }

        // 2. Otherwise -> Hide it for this user
        await prisma.hiddenExercise.create({
            data: {
                userId,
                exerciseId: id
            }
        });

        res.json({ message: 'Exercise hidden from your library', type: 'HIDDEN' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete exercise' });
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
                userId: req.user.userId, // Link to creator
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

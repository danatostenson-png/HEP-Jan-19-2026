const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});

exports.processExpressImport = async (req, res) => {
    try {
        const { text, globalCadence } = req.body;
        const userId = req.user.userId; // From auth middleware

        if (!text) {
            return res.status(400).json({ message: 'No text provided' });
        }

        const lines = text.split('\n').filter(line => line.trim().length > 0);
        const parsedExercises = [];
        let parsedCount = 0;

        for (const line of lines) {
            const parsed = await parseLine(line, globalCadence);
            if (parsed) {
                parsedExercises.push(parsed);
                parsedCount++;
            }
        }

        // Log the import
        await prisma.expressImportLog.create({
            data: {
                rawText: text,
                parsedCount: parsedCount,
                userId: userId,
            }
        });

        res.json({ exercises: parsedExercises });

    } catch (error) {
        console.error('Error in express import:', error);
        res.status(500).json({ message: 'Failed to process import', error: error.message });
    }
};

async function parseLine(line, globalCadence) {
    let cleanLine = line.trim();

    // Dosage Extraction Results
    let sets = null;
    let reps = null;
    let weight = null;
    let frequency = globalCadence || null;

    // PATTERN 1: Sets x Reps (Strict boundary: 3x10, 3 x 10)
    // Matches: "3x10", "3 x 10"
    const setsRepsRegex = /\b(\d+)\s*[xX]\s*(\d+)\b/;
    const setsRepsMatch = cleanLine.match(setsRepsRegex);
    if (setsRepsMatch) {
        sets = setsRepsMatch[1];
        reps = setsRepsMatch[2];
        cleanLine = cleanLine.replace(setsRepsMatch[0], ' ').trim();
    }

    // PATTERN 2: Explicit Sets (e.g. "3 sets", "3 Sets") - Capture ONLY if sets not already found
    if (!sets) {
        const setsRegex = /\b(\d+)\s*(?:sets?)\b/i;
        const setsMatch = cleanLine.match(setsRegex);
        if (setsMatch) {
            sets = setsMatch[1];
            cleanLine = cleanLine.replace(setsMatch[0], ' ').trim();
        }
    }

    // PATTERN 3: Explicit Reps (e.g. "10 reps", "10 Reps") - Capture ONLY if reps not already found
    if (!reps) {
        const repsRegex = /\b(\d+)\s*(?:reps?)\b/i;
        const repsMatch = cleanLine.match(repsRegex);
        if (repsMatch) {
            reps = repsMatch[1];
            cleanLine = cleanLine.replace(repsMatch[0], ' ').trim();
        }
    }

    // PATTERN 4: Weight (20lbs, 10kg, 50 lbs)
    const weightRegex = /\b(\d+(?:\.\d+)?)\s*(?:lbs?|kg|pounds?)\b/i;
    const weightMatch = cleanLine.match(weightRegex);
    if (weightMatch) {
        weight = weightMatch[0];
        cleanLine = cleanLine.replace(weightMatch[0], ' ').trim();
    }

    // PATTERN 5: Frequency (3x/week, 3 times a week, daily)
    const freqRegex = /\b(\d+x\/?\s*week|daily|every other day|\d+\s*times?\s*(?:a|per)\s*(?:day|week))\b/i;
    const freqMatch = cleanLine.match(freqRegex);
    if (freqMatch) {
        frequency = freqMatch[0];
        cleanLine = cleanLine.replace(freqMatch[0], ' ').trim();
    }

    // CLEANUP STAGE
    // 1. Remove stray keywords "of", "x", "reps", "sets", "set", "rep"
    cleanLine = cleanLine.replace(/\b(?:of|x|reps?|sets?)\b/gi, ' ').trim();

    // 2. Remove trailing/leading delimiters
    cleanLine = cleanLine.replace(/^[-:.,;]+|[-:.,;]+$/g, '').trim();

    // 3. Remove trailing ISOLATED numbers that are likely leftover dosage artifacts
    // Strategy: If the name ends with a number that is distinct (whitespace before it), strip it.
    // e.g. "Deadlift 3" -> "Deadlift". "Step 2" -> "Step 2" (heuristic: strict end of line check)
    // We'll trust "Step 2" is valid, but "Squat 3" is likely "Squat 3 sets".
    // Since we extracted sets/reps already, any lone number at the end is suspicious.
    // However, "Phase 1" or "Step 2" should be kept.
    // Heuristic: If we successfully extracted sets/reps, be aggressive. If not, be conservative.
    if (sets || reps) {
        cleanLine = cleanLine.replace(/\s+\d+$/, '').trim();
    }

    // 4. Collapse whitespace
    cleanLine = cleanLine.replace(/\s+/g, ' ');

    let title = cleanLine;
    if (title.length === 0) return null;

    // MATCHING
    const match = await prisma.exercise.findFirst({
        where: {
            title: {
                contains: title
            },
            isCustom: false
        }
    });

    return {
        originalLine: line,
        title: match ? match.title : title,
        cleanedTitle: title,
        description: match ? match.description : null,
        imageUrl: match ? match.imageUrl : null,
        matchedExerciseId: match ? match.id : null,
        sets: sets,
        reps: reps,
        weight: weight,
        frequency: frequency,
        notes: null,
        matchConfidence: match ? 1 : 0,
        isNewCustom: !match,
    };
}

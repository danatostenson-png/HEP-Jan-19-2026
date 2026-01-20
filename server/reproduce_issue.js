
const performTest = () => {
    const inputs = [
        "barbell bent over row 115lb 3 sets of 10 reps",
        "squats 10 reps 3 sets",
        // Test dirty strings with Non-Breaking Spaces
        "squats 10\u00A0reps 3\u00A0sets",
        "dirty\u00A0row 3x10"
    ];

    const globalCadence = "twice a week";

    inputs.forEach(line => {
        console.log(`\n--- Testing: "${line}" ---`);
        const result = parseLine(line, globalCadence);
        console.log("Result:", JSON.stringify(result, null, 2));
    });
};

function parseLine(line, globalCadence) {
    // 1. Normalize unicode spaces to standard space
    let cleanLine = line.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ').trim();

    // Dosage Extraction Results
    let sets = null;
    let reps = null;
    let weight = null;
    let frequency = globalCadence || null;

    // PATTERN 0: Explicit "X sets of Y reps" (Strongest match)
    const setsOfRepsRegex = /\b(\d+)\s*sets?\s*of\s*(\d+)\s*reps?\b/i;
    const setsOfMatch = cleanLine.match(setsOfRepsRegex);
    if (setsOfMatch) {
        sets = setsOfMatch[1];
        reps = setsOfMatch[2];
        cleanLine = cleanLine.replace(setsOfMatch[0], ' ').trim();
        console.log(`Matched SetsOfReps: ${setsOfMatch[0]}`);
    }

    // PATTERN 1: Sets x Reps (Strict boundary: 3x10, 3 x 10)
    // Only run if we haven't found sets/reps yet
    if (!sets && !reps) {
        const setsRepsRegex = /\b(\d+)\s*[xX]\s*(\d+)\b/;
        const setsRepsMatch = cleanLine.match(setsRepsRegex);
        if (setsRepsMatch) {
            sets = setsRepsMatch[1];
            reps = setsRepsMatch[2];
            cleanLine = cleanLine.replace(setsRepsMatch[0], ' ').trim();
            console.log(`Matched 3x10: ${setsRepsMatch[0]}`);
        }
    }

    // PATTERN 2: Explicit Sets (e.g. "3 sets", "3 Sets") - Capture ONLY if sets not already found
    if (!sets) {
        const setsRegex = /\b(\d+)\s*(?:sets?)\b/i;
        const setsMatch = cleanLine.match(setsRegex);
        if (setsMatch) {
            sets = setsMatch[1];
            cleanLine = cleanLine.replace(setsMatch[0], ' ').trim();
            console.log(`Matched Sets: ${setsMatch[0]}`);
        }
    }

    // PATTERN 3: Explicit Reps (e.g. "10 reps", "10 Reps") - Capture ONLY if reps not already found
    if (!reps) {
        const repsRegex = /\b(\d+)\s*(?:reps?)\b/i;
        const repsMatch = cleanLine.match(repsRegex);
        if (repsMatch) {
            reps = repsMatch[1];
            cleanLine = cleanLine.replace(repsMatch[0], ' ').trim();
            console.log(`Matched Reps: ${repsMatch[0]}`);
        }
    }

    // PATTERN 4: Weight (20lbs, 10kg, 50 lbs)
    const weightRegex = /\b(\d+(?:\.\d+)?)\s*(?:lbs?|kg|pounds?)\b/i;
    const weightMatch = cleanLine.match(weightRegex);
    if (weightMatch) {
        weight = weightMatch[0];
        cleanLine = cleanLine.replace(weightMatch[0], ' ').trim();
        console.log(`Matched Weight: ${weightMatch[0]}`);
    }

    // PATTERN 5: Frequency (3x/week, 3 times a week, daily)
    const freqRegex = /\b(\d+x\/?\s*week|daily|every other day|\d+\s*times?\s*(?:a|per)\s*(?:day|week))\b/i;
    const freqMatch = cleanLine.match(freqRegex);
    if (freqMatch) {
        frequency = freqMatch[0];
        cleanLine = cleanLine.replace(freqMatch[0], ' ').trim();
        console.log(`Matched Frequency: ${freqMatch[0]}`);
    }

    // CLEANUP STAGE
    cleanLine = cleanLine.replace(/\b(?:of|x|reps?|sets?)\b/gi, ' ').trim();
    cleanLine = cleanLine.replace(/^[-:.,;]+|[-:.,;]+$/g, '').trim();

    // Aggressive number removal if dosage found
    if (sets || reps) {
        cleanLine = cleanLine.replace(/\s+\d+$/, '').trim();
    }

    cleanLine = cleanLine.replace(/\s+/g, ' ');

    return {
        title: cleanLine,
        sets,
        reps,
        weight,
        frequency
    };
}

performTest();

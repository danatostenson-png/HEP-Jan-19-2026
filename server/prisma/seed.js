const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // 1. Create a Test Practitioner if not exists
    const email = 'test@example.com';
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Test Practitioner',
                clinicName: 'Test Clinic',
            },
        });
        console.log(`Created user: ${user.email}`);
    }

    // 2. Create Sample Patients
    const patientData = [
        { name: 'John Doe', diagnosis: 'ACL Reconstruction', email: 'john@example.com' },
        { name: 'Jane Smith', diagnosis: 'Rotator Cuff Tendonitis', email: 'jane@example.com' },
        { name: 'Michael Johnson', diagnosis: 'Low Back Pain', email: 'mike@example.com' },
    ];

    for (const p of patientData) {
        const existing = await prisma.patient.findFirst({ where: { email: p.email } });
        if (!existing) {
            await prisma.patient.create({
                data: {
                    ...p,
                    userId: user.id,
                },
            });
            console.log(`Created patient: ${p.name}`);
        }
    }

    // 3. Seed Exercise Library
    const exercises = [
        {
            title: 'Goblet Squat',
            description: 'Hold a weight at chest height. Squat down keeping your chest up and knees out.',
            bodyPart: 'Legs',
            difficulty: 'Intermediate',
            tags: 'Squat,Quads,Glutes,Strength',
            imageUrl: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&q=80&w=800',
        },
        {
            title: 'Pallof Twist',
            description: 'Stand sideways to cable anchor. distinct core exercise preventing rotation.',
            bodyPart: 'Core',
            difficulty: 'Advanced',
            tags: 'Core,Anti-Rotation,Abs',
            imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
        },
        {
            title: 'Cable Single Arm Chest Press',
            description: 'Press the cable handle forward with one arm while maintaining a stable stance.',
            bodyPart: 'Chest',
            difficulty: 'Intermediate',
            tags: 'Chest,Push,Unilateral',
            imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
        },
        {
            title: 'Seated Hamstring Curl',
            description: 'Sit in machine, curl legs back using hamstrings. Control the weight on the way up.',
            bodyPart: 'Legs',
            difficulty: 'Easy',
            tags: 'Hamstrings,Legs,Machine',
            imageUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699ded?auto=format&fit=crop&q=80&w=800',
        },
        {
            title: 'External Rotation (Side Lying)',
            description: 'Lie on side, keep elbow tucked to side, rotate arm upward.',
            bodyPart: 'Shoulder',
            difficulty: 'Easy',
            tags: 'Shoulder,Rotator Cuff,Rehab',
            imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=800',
        }
    ];

    for (const ex of exercises) {
        const existing = await prisma.exercise.findFirst({ where: { title: ex.title } });
        if (!existing) {
            await prisma.exercise.create({
                data: ex,
            });
            console.log(`Created exercise: ${ex.title}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

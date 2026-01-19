
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const ex = await prisma.exercise.findFirst({
        orderBy: { createdAt: 'desc' }
    });
    console.log(JSON.stringify(ex, null, 2));
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

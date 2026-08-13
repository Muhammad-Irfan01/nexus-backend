const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docId = '922d57d4-c9c5-4c37-901e-f49d60efa109';
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: { chunks: true }
  });
  console.log(JSON.stringify(doc, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

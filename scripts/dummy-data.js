const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // clear out the database
  await prisma.note.deleteMany();
  await prisma.list.deleteMany();

  const note1 = await prisma.note.create({
    data: { text: "Note 1", author: "Taylor" },
  });

  const note2 = await prisma.note.create({
    data: { text: "Note 2", author: "Emily2" },
  });

  const note3 = await prisma.note.create({
    data: { text: "Note 3", author: "Nobody" },
  });

  await prisma.list.create({
    data: { name: "List 1", notes: { connect: [{ id: note1.id }, { id: note2.id }] } },
  });

  await prisma.list.create({
    data: { name: "List 2", notes: { connect: [{ id: note2.id }, { id: note3.id }] } },
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

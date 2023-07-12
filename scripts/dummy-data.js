const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // clear out the database
  await prisma.note.deleteMany();
  await prisma.list.deleteMany();

  const note1 = await prisma.note.create({
    data: { text: "Grocery shopping list for the week", author: "Alex" },
  });

  const note2 = await prisma.note.create({
    data: { text: "Goals for this year", author: "Alex" },
  });

  const note3 = await prisma.note.create({
    data: { text: "Books to read", author: "Alex" },
  });

  const note4 = await prisma.note.create({
    data: { text: "Exercise routine for this month", author: "Alex" },
  });

  const note5 = await prisma.note.create({
    data: { text: "Birthday gift ideas", author: "Alex" },
  });

  await prisma.list.create({
    data: { name: "Daily To-Dos", notes: { connect: [{ id: note1.id }, { id: note2.id }] } },
  });

  await prisma.list.create({
    data: { name: "Personal Goals", notes: { connect: [{ id: note2.id }, { id: note3.id }] } },
  });

  await prisma.list.create({
    data: { name: "Bookshelf", notes: { connect: [{ id: note3.id }, { id: note4.id }] } },
  });

  await prisma.list.create({
    data: { name: "Fitness Routine", notes: { connect: [{ id: note4.id }, { id: note5.id }] } },
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { ApolloServer, gql } = require("apollo-server");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const typeDefs = gql`
  type Note {
    id: Int!
    text: String!
    author: String!
    createdAt: String!
    updatedAt: String!
  }

  type List {
    id: Int!
    name: String!
    notes: [Note!]!
  }

  type Query {
    allNotes: [Note!]!
    allLists: [List!]!
    getList(id: Int!): List
  }
`;

const resolvers = {
  Query: {
    allNotes: () => prisma.note.findMany(),
    allLists: () => prisma.list.findMany({ include: { notes: true } }),
    getList: (parent, args) =>
      prisma.list.findUnique({ where: { id: args.id }, include: { notes: true } }),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

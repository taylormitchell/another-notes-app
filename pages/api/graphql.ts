import { ApolloServer, gql } from "apollo-server-micro";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

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

// @todo what does this do?
export const config = {
  api: {
    bodyParser: false,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const serverStartPromise = server.start();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await serverStartPromise;
  return server.createHandler({ path: "/api/graphql" })(req, res);
};

import { ApolloServer, gql } from "apollo-server-micro";
import { PrismaClient, Note as PrismaNote } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { buildSchema } from "graphql";
import { Resolvers, Note as GraphQLNote, List as GraphQLList } from "./schema.graphql";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Read the schema file
const schemaPath = path.join(process.cwd(), "pages/api/schema.graphql"); // Adjust path to your file
const schemaString = fs.readFileSync(schemaPath, "utf8");
const typeDefs = buildSchema(schemaString);

function prismaNoteToGraphql(note: PrismaNote): GraphQLNote {
  return {
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

// @todo typechecking isn't working anymore
const resolvers: Resolvers = {
  Query: {
    allNotes: async () => {
      const notes = await prisma.note.findMany();
      return notes.map(prismaNoteToGraphql);
    },
    allLists: async () => {
      const lists = await prisma.list.findMany({ include: { notes: true } });
      return lists.map((list) => ({
        ...list,
        notes: list.notes.map(prismaNoteToGraphql),
      }));
    },
    getList: async (_, args: { id: number }) => {
      const list = await prisma.list.findUnique({
        where: { id: args.id },
        include: { notes: true },
      });
      return {
        ...list,
        notes: list.notes.map(prismaNoteToGraphql),
      };
    },
    getNote: async (_, args: { id: number }) => {
      // @todo what if note doesn't exist?
      const note = await prisma.note.findUnique({
        where: { id: args.id },
        include: { lists: true },
      });
      return prismaNoteToGraphql(note);
    },
  },
  Mutation: {
    createNote: async (_, args: { text: string; author: string }) => {
      const note = await prisma.note.create({
        data: {
          text: args.text,
          author: args.author,
        },
      });
      return prismaNoteToGraphql(note);
    },
    createList: async (_, args: { name: string }) => {
      const list = await prisma.list.create({
        data: {
          name: args.name,
        },
      });
      return list;
    },
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

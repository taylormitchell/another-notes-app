import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { NoteWithRelations } from "../../../../types";
import { ResponseBody } from "../types";
import { z } from "zod";

export type getNotesResponse = ResponseBody<NoteWithRelations[]>;
export type postNoteResponse = ResponseBody<NoteWithRelations>;
const postNotesSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  author: z.string(),
});
export type postNotesRequest = z.infer<typeof postNotesSchema>;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      let body: postNoteResponse;
      const { id, text, author } = postNotesSchema.parse(req.body);
      const note = await prisma.note.create({
        data: { id, text, author },
        include: { relatedLists: true, relatedNotes: true },
      });
      body = { value: note };
      return res.json(body);
    } else if (req.method === "GET") {
      let body: getNotesResponse;
      const notes = await prisma.note.findMany({
        include: { relatedLists: true, relatedNotes: true },
      });
      body = { value: notes };
      return res.json(body);
    } else {
      const body = { error: "Method not allowed" };
      return res.status(405).json(body);
    }
  } catch (e) {
    console.error(e);
    const body: ResponseBody<unknown> = { error: e instanceof Error ? e.message : "Unknown error" };
    return res.status(500).json(body);
  }
}

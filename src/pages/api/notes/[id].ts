import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { NoteWithRelations } from "../../../../types";
import { ResponseBody } from "../types";

export type getNoteResponse = ResponseBody<NoteWithRelations>;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const noteId = req.query.id;
  if (Array.isArray(noteId)) {
    return res.status(400).send("Expected a single note ID");
  }
  let body: getNoteResponse;
  try {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { relatedLists: true, relatedNotes: true },
    });
    body = { value: note };
    return res.json(body);
  } catch (e) {
    console.error(e);
    body = { error: e instanceof Error ? e.message : "Unknown error" };
    return res.status(500).json(body);
  }
}

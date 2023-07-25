import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { NoteWithRelations } from "../../../../types";
import { ResponseBody } from "../types";

export type getNotesResponse = ResponseBody<NoteWithRelations[]>;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  let body: getNotesResponse;
  try {
    const notes = await prisma.note.findMany({
      include: { relatedLists: true, relatedNotes: true },
    });
    body = { value: notes };
    return res.json(body);
  } catch (e) {
    console.error(e);
    body = { error: e instanceof Error ? e.message : "Unknown error" };
    return res.status(500).json(body);
  }
}

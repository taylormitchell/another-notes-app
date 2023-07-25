import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { ListWithChildren, NoteWithRelations } from "../../../../types";
import { ResponseBody } from "../types";

export type getListResponse = ResponseBody<ListWithChildren>;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const listId = req.query.id;
  if (Array.isArray(listId)) {
    return res.status(400).send("Expected a single list ID");
  }
  let body: getListResponse;
  try {
    const list = await prisma.list.findUnique({
      where: { id: Number(listId) },
      include: { notes: true },
    });
    body = { value: list };
    return res.json(body);
  } catch (e) {
    console.error(e);
    body = { error: e instanceof Error ? e.message : "Unknown error" };
    return res.status(500).json(body);
  }
}

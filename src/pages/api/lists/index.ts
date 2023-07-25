import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { ResponseBody } from "../types";
import { List } from "@prisma/client";

export type getListsResponse = ResponseBody<List[]>;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  let body: getListsResponse;
  try {
    const lists = await prisma.list.findMany({});
    body = { value: lists };
    return res.json(body);
  } catch (e) {
    console.error(e);
    body = { error: e instanceof Error ? e.message : "Unknown error" };
    return res.status(500).json(body);
  }
}

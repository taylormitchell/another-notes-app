import { createBackendSqlite } from "@/lib/sqlite";
import fs from "fs";

const sqlitePromise = fs.promises.readFile("data.sqlite").then((buffer) => {
  return createBackendSqlite(buffer);
});

// Return full sqlite database to client
export default async function handler(req: any, res: any) {
  const sqlite = await sqlitePromise;
  const data = sqlite.export();
  res.setHeader("Content-Type", "application/octet-stream");
  res.status(200).send(Buffer.from(data));
}

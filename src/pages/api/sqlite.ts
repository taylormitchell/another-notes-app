import { createBackendSqlite } from "@/lib/sqlite";
import fs from "fs";

const sqlitePromise = fs.promises.readFile("data.sqlite").then((buffer) => {
  return createBackendSqlite(buffer);
});

// Return full sqlite database to client
export default async function handler(req: any, res: any) {
  // get
  if (req.method === "GET") {
    const sqlite = await sqlitePromise;
    const data = sqlite.export();
    res.setHeader("Content-Type", "application/octet-stream");
    res.status(200).send(Buffer.from(data));
  } else if (req.method === "POST") {
    // user sends sql and params to execute on sqlite
    try {
      const sqlite = await sqlitePromise;
      const { sql, params } = req.body;
      console.log("executing sql: ", { sql, params });
      sqlite.exec(sql, params);
      const data = sqlite.export();
      fs.writeFileSync("data.sqlite", data);
      res.status(200).send("ok");
    } catch (e) {
      console.log(e);
      res.status(400).send("bad request");
    }
  } else {
    res.status(400).send("bad request");
  }
}

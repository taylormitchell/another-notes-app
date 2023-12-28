import fs from "fs";
import sqlite3 from "sqlite3";
import { downloadSqlite, uploadSqlite } from "./s3";
import { backend_env } from "./backend_env";

const sqliteFile = backend_env.FILE_NAME;

/**
 * This is a promise that resolves to a sqlite3 database.
 * It is initialized with the sqlite database from s3.
 *
 * TODO - should download from s3 every time?
 */
const sqlitePromise = (async () => {
  const buf = await downloadSqlite();
  fs.writeFileSync(sqliteFile, buf);
  return new sqlite3.Database(sqliteFile);
})();

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    await sqlitePromise;
    const data = fs.readFileSync(sqliteFile);
    res.setHeader("Content-Type", "application/octet-stream");
    res.status(200).send(data);
  } else if (req.method === "POST") {
    try {
      const sqlite = await sqlitePromise;
      const { sql, params } = req.body;
      console.log("executing sql: ", { sql, params });
      sqlite.run(sql, params);
      // Save the sqlite file to s3 after every write
      // TODO - maybe we should do this periodically instead?
      uploadSqlite(fs.readFileSync(sqliteFile));
      res.status(200).send("ok");
    } catch (e) {
      console.log(e);
      res.status(400).send("bad request");
    }
  } else {
    res.status(400).send("bad request");
  }
}

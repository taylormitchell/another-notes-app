import fs from "fs";
import sqlite3 from "sqlite3";
import { download, upload } from "./s3";

const sqliteFile = "data.sqlite";

async function createSqlite() {
  const data = await download();
  if (!data.Body) throw new Error("no body");
  const buf = await data.Body.transformToByteArray();
  fs.writeFileSync(sqliteFile, buf);
  return new sqlite3.Database(sqliteFile);
}

const sqlitePromise = createSqlite();

// Upload sqlite database to s3 every 5 minutes
// setInterval(() => {
//   try {
//     const data = fs.readFileSync(sqliteFile);
//     upload(data);
//     console.log("uploaded sqlite database to s3");
//   } catch (e) {
//     console.error("error uploading sqlite database to s3", e);
//   }
// }, 1000 * 60 * 5); // every 5 minutes

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
      upload(fs.readFileSync(sqliteFile));
      res.status(200).send("ok");
    } catch (e) {
      console.log(e);
      res.status(400).send("bad request");
    }
  } else {
    res.status(400).send("bad request");
  }
}

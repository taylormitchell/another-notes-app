import fs from "fs";
import sqlite3 from "sqlite3";
import { downloadSqlite, uploadSqlite } from "./s3";

const sqliteFile = "data.sqlite";

const sqlitePromise = (async () => {
  // todo - maybe should download from s3 every time?
  if (fs.existsSync(sqliteFile)) {
    return new sqlite3.Database(sqliteFile);
  } else {
    const buf = await downloadSqlite();
    fs.writeFileSync(sqliteFile, buf);
    return new sqlite3.Database(sqliteFile);
  }
})();

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

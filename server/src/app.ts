import fs from "fs";
import express from "express";
import sqlite3, { RunResult } from "sqlite3";
import path from "path";
import cors from "cors";
import { env } from "./env";
import { downloadSqlite, uploadSqlite } from "./s3";
import { migrations } from "./migrations";

const app = express();
app.use(cors());
app.use(express.json());
const port = env.PORT;

export const sqliteFile = env.FILE_NAME;

function getVersion(db: sqlite3.Database): Promise<number> {
  return new Promise((resolve, reject) => {
    db.get<{ user_version: number }>("PRAGMA user_version", (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row["user_version"] : 0);
      }
    });
  });
}

async function exec(db: sqlite3.Database, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err: Error | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * This is a promise that resolves to a sqlite3 database.
 * It is initialized with the sqlite database from s3.
 *
 * TODO - should download from s3 every time?
 */
export const sqlitePromise = (async () => {
  const buf = await downloadSqlite();
  fs.writeFileSync(sqliteFile, buf);
  const db = new sqlite3.Database(sqliteFile);
  // Apply migrations
  const version = await getVersion(db);
  console.log("current sqlite version: ", version);
  console.log("latest migration version: ", migrations[migrations.length - 1].version);
  if (version < migrations.length - 1) {
    for (let i = version + 1; i < migrations.length; i++) {
      const migration = migrations[i];
      console.log("applying migration: ", migration);
      await exec(db, migration.sql);
    }
    const newVersion = await getVersion(db);
    console.log("new sqlite version: ", newVersion);
    await uploadSqlite(fs.readFileSync(sqliteFile));
  } else {
    console.log("no migrations to apply");
  }
  return db;
})();

// Save the sqlite file to s3 every minute
// and when the process exits
let isDirty = false;
setInterval(() => {
  if (isDirty) {
    try {
      uploadSqlite(fs.readFileSync(sqliteFile));
      isDirty = false;
    } catch (e) {
      console.log(e);
    }
  }
}, 1 * 60 * 1000); // 1 minute
process.on("exit", () => {
  uploadSqlite(fs.readFileSync(sqliteFile));
});

app.use("/api/sqlite", async (req: any, res: any) => {
  console.log("request to /api/sqlite");
  if (req.method === "GET") {
    await sqlitePromise;
    const data = fs.readFileSync(sqliteFile);
    console.log("sending sqlite file");
    res.setHeader("Content-Type", "application/octet-stream");
    res.status(200).send(data);
  } else if (req.method === "POST") {
    try {
      const sqlite = await sqlitePromise;
      const { sql, params } = req.body;
      console.log("executing sql: ", { sql, params });
      sqlite.run(sql as string, params, (result: RunResult, err: Error | null) => {
        if (err) {
          console.log(err);
          res.status(400).send("bad request");
        } else {
          console.log(result);
          isDirty = true;
          res.status(200).send("ok");
        }
      });
    } catch (e) {
      console.log(e);
      res.status(400).send("bad request");
    }
  } else {
    res.status(400).send("bad request");
  }
});

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

// Server static assets from the React app
const staticDir = path.join(__dirname, env.CLIENT_DIR);
app.use(express.static(staticDir));
// The "catchall" handler: for any request that doesn't
// match one above, send back the index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

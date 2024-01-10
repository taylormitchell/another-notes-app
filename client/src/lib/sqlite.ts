import initSqlJs from "sql.js";
import { log } from "./log";

export async function createSqlite(data?: ArrayLike<number> | Buffer | null | undefined) {
  log("sqlite").info("initializing sql.js");
  const SQL = await initSqlJs({ locateFile: (file) => `/${file}` });
  log("sqlite").info("creating database with data: ", data);
  return data ? new SQL.Database(data) : new SQL.Database();
}

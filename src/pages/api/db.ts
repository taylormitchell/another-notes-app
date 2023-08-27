import { Client } from "pg";
import invariant from "tiny-invariant";

export default async function handler(req: any, res: any) {
  console.log("req.body", req.body);
  // invariant(req.body instanceof Object, "req.body must be an object");
  // let queries = [];
  // if (req.body.transaction) {
  //   queries = req.body.transaction;
  // } else {
  //   queries = [req.body];
  // }
  const queries = req.body;
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    await client.query("BEGIN");
    let lastResult;
    for (let { query, params } of queries) {
      lastResult = await client.query(query, params);
    }
    await client.query("COMMIT");
    res.status(200).json(lastResult.rows); // Send the result of the last query back as response
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
}

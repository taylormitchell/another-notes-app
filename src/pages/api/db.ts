import { Client } from "pg";

export default async function handler(req: any, res: any) {
  console.log("req.body", req.body);
  const statements = req.body;
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    await client.query("BEGIN");
    let lastResult;
    for (let stm of statements) {
      lastResult = await client.query(stm.query, stm.params ?? []);
    }
    await client.query("COMMIT");
    res.status(200).json(lastResult.rows); // Send the result of the last query back as response
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error while executing:", statements, err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
}

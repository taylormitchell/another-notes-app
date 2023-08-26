import { Client } from "pg";

export default async function handler(req: any, res: any) {
  console.log("req.body", req.body);
  const { query, params } = req.body;
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await client.connect();
    const { rows } = await client.query(query, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
}

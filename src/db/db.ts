// Neon Serverless 1
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema"
export const sql = neon(process.env.DARAJA_BASE_URL as string);
const db = drizzle(sql, {schema, logger: true});
export default db;


// Node-Postgres Server
// import "dotenv/config";
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Client } from "pg";
// import * as schema from "./schema"
// export const client = new Client({
//   connectionString: process.env.Database_URL as string,
// })
// const main = async ()=>{
//   await client.connect();
// }
// main();
// const db = drizzle(client, { schema, logger: true });
// export default db;



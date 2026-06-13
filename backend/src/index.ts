import { initDb } from "./db";
import { startApi } from "./api";
import { startIndexer } from "./indexer";

async function main() {
  console.log("[main] initializing database...");
  await initDb();

  console.log("[main] starting API...");
  await startApi();

  console.log("[main] starting indexer...");
  await startIndexer();
}

main().catch((err) => {
  console.error("[main] fatal:", err);
  process.exit(1);
});

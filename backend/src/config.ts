import "dotenv/config";

function require_env(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

export const config = {
  rpcUrl: require_env("RPC_URL"),
  contractAddress: require_env("CONTRACT_ADDRESS"),
  contractBlock: parseInt(process.env["CONTRACT_BLOCK"] ?? "0", 10),
  confirmations: parseInt(process.env["CONFIRMATIONS"] ?? "3", 10),
  databaseUrl: require_env("DATABASE_URL"),
  port: parseInt(process.env["PORT"] ?? "3001", 10),
  pollIntervalMs: parseInt(process.env["POLL_INTERVAL_MS"] ?? "12000", 10),
  batchSize: parseInt(process.env["BATCH_SIZE"] ?? "10", 10),
};

import { Pool } from "pg";
import { config } from "./config";

export const pool = new Pool({ connectionString: config.databaseUrl });

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tips (
      id          SERIAL PRIMARY KEY,
      "from"      TEXT        NOT NULL,
      amount      TEXT        NOT NULL,
      message     TEXT        NOT NULL,
      tx_hash     TEXT        NOT NULL UNIQUE,
      block_number BIGINT     NOT NULL,
      block_hash  TEXT        NOT NULL,
      timestamp   TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS indexer_state (
      id                  INT PRIMARY KEY DEFAULT 1,
      last_processed_block BIGINT NOT NULL DEFAULT 0
    );

    INSERT INTO indexer_state (id, last_processed_block)
    VALUES (1, 0)
    ON CONFLICT (id) DO NOTHING;
  `);
}

export interface Tip {
  from: string;
  amount: string;
  message: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
}

export async function getLastProcessedBlock(): Promise<number> {
  const { rows } = await pool.query<{ last_processed_block: string }>(
    "SELECT last_processed_block FROM indexer_state WHERE id = 1"
  );
  return parseInt(rows[0]?.last_processed_block ?? "0", 10);
}

export async function setLastProcessedBlock(block: number): Promise<void> {
  await pool.query(
    "UPDATE indexer_state SET last_processed_block = $1 WHERE id = 1",
    [block]
  );
}

export async function insertTip(params: {
  from: string;
  amount: string;
  message: string;
  txHash: string;
  blockNumber: number;
  blockHash: string;
  timestamp: Date;
}): Promise<void> {
  await pool.query(
    `INSERT INTO tips ("from", amount, message, tx_hash, block_number, block_hash, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (tx_hash) DO NOTHING`,
    [
      params.from,
      params.amount,
      params.message,
      params.txHash,
      params.blockNumber,
      params.blockHash,
      params.timestamp,
    ]
  );
}

export async function removeTipsFromBlock(blockNumber: number): Promise<void> {
  await pool.query("DELETE FROM tips WHERE block_number = $1", [blockNumber]);
}

export async function getTips(): Promise<Tip[]> {
  const { rows } = await pool.query<{
    from: string;
    amount: string;
    message: string;
    tx_hash: string;
    block_number: string;
    timestamp: string;
  }>(
    `SELECT "from", amount, message, tx_hash, block_number, timestamp
     FROM tips ORDER BY block_number DESC, id DESC`
  );
  return rows.map((r) => ({
    from: r.from,
    amount: r.amount,
    message: r.message,
    txHash: r.tx_hash,
    blockNumber: parseInt(r.block_number, 10),
    timestamp: r.timestamp,
  }));
}

export async function getTipsByAddress(address: string): Promise<Tip[]> {
  const { rows } = await pool.query<{
    from: string;
    amount: string;
    message: string;
    tx_hash: string;
    block_number: string;
    timestamp: string;
  }>(
    `SELECT "from", amount, message, tx_hash, block_number, timestamp
     FROM tips WHERE LOWER("from") = LOWER($1) ORDER BY block_number DESC, id DESC`,
    [address]
  );
  return rows.map((r) => ({
    from: r.from,
    amount: r.amount,
    message: r.message,
    txHash: r.tx_hash,
    blockNumber: parseInt(r.block_number, 10),
    timestamp: r.timestamp,
  }));
}

export async function getTipCount(): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*) AS count FROM tips"
  );
  return parseInt(rows[0]?.count ?? "0", 10);
}

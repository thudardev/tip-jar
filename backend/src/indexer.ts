import { ethers } from "ethers";
import { config } from "./config";
import {
  getLastProcessedBlock,
  setLastProcessedBlock,
  insertTip,
  removeTipsFromBlock,
} from "./db";

const ABI = [
  "event NewTip(address indexed from, uint256 amount, string message)",
];

export async function startIndexer(): Promise<void> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const contract = new ethers.Contract(config.contractAddress, ABI, provider);

  console.log("[indexer] started, polling every", config.pollIntervalMs, "ms");

  async function poll() {
    try {
      const chainHead = await provider.getBlockNumber();
      const safeHead = chainHead - config.confirmations;
      if (safeHead < 0) return;

      const lastProcessed = await getLastProcessedBlock();
      const fromBlock = Math.max(lastProcessed + 1, config.contractBlock);

      if (fromBlock > safeHead) return;

      const toBlock = Math.min(fromBlock + config.batchSize - 1, safeHead);

      // Reorg check: verify stored block hashes are still canonical
      await checkReorgs(provider, lastProcessed);

      const filter = contract.filters["NewTip"]();
      const logs = await contract.queryFilter(filter, fromBlock, toBlock);

      for (const log of logs) {
        if (!("args" in log)) continue;
        const args = log.args as unknown as {
          from: string;
          amount: bigint;
          message: string;
        };
        const { from, amount, message } = args;

        const block = await provider.getBlock(log.blockNumber);
        if (!block) continue;

        await insertTip({
          from,
          amount: ethers.formatEther(amount),
          message,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          blockHash: log.blockHash,
          timestamp: new Date(block.timestamp * 1000),
        });

        console.log(
          `[indexer] indexed tip from ${from} — ${ethers.formatEther(amount)} ETH (block ${log.blockNumber})`
        );
      }

      await setLastProcessedBlock(toBlock);
    } catch (err) {
      console.error("[indexer] poll error:", err);
    }
  }

  await poll();
  setInterval(poll, config.pollIntervalMs);
}

async function checkReorgs(
  provider: ethers.JsonRpcProvider,
  lastProcessed: number
): Promise<void> {
  if (lastProcessed === 0) return;

  // Check up to 10 recently processed blocks for reorgs
  const { pool } = await import("./db");
  const { rows } = await pool.query<{
    block_number: string;
    block_hash: string;
  }>(
    `SELECT DISTINCT block_number, block_hash FROM tips
     WHERE block_number > $1
     ORDER BY block_number DESC LIMIT 10`,
    [Math.max(0, lastProcessed - 20)]
  );

  for (const row of rows) {
    const blockNumber = parseInt(row.block_number, 10);
    const storedHash = row.block_hash;

    try {
      const block = await provider.getBlock(blockNumber);
      if (!block || block.hash !== storedHash) {
        console.warn(
          `[indexer] reorg detected at block ${blockNumber} — removing tips`
        );
        await removeTipsFromBlock(blockNumber);
      }
    } catch {
      // RPC error — skip this block check
    }
  }
}

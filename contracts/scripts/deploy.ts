import { ethers, run, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const factory = await ethers.getContractFactory("TipJar");
  const tipJar = await factory.deploy();
  await tipJar.waitForDeployment();

  const address = await tipJar.getAddress();
  const deployBlock = await ethers.provider.getBlockNumber();

  console.log("\nTipJar deployed!");
  console.log("  Address:      ", address);
  console.log("  Deploy block: ", deployBlock);
  console.log("  Network:      ", network.name);

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nWaiting 5 confirmations before Etherscan verification...");
    await tipJar.deploymentTransaction()?.wait(5);

    await run("verify:verify", {
      address,
      constructorArguments: [],
    });
    console.log("Verified on Etherscan.");
  }

  console.log("\nAdd to backend/.env:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log(`CONTRACT_BLOCK=${deployBlock}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

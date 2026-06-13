import { expect } from "chai";
import { ethers } from "hardhat";
import { TipJar } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { parseEther } from "ethers";

describe("TipJar", () => {
  let tipJar: TipJar;
  let owner: HardhatEthersSigner;
  let tipper: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  beforeEach(async () => {
    [owner, tipper, other] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("TipJar");
    tipJar = (await factory.deploy()) as TipJar;
    await tipJar.waitForDeployment();
  });

  describe("tip()", () => {
    it("emits NewTip with correct from, amount, and message", async () => {
      const amount = parseEther("0.01");
      const message = "great work!";

      await expect(tipJar.connect(tipper).tip(message, { value: amount }))
        .to.emit(tipJar, "NewTip")
        .withArgs(tipper.address, amount, message);
    });

    it("increases contract balance", async () => {
      await tipJar.connect(tipper).tip("hello", { value: parseEther("0.05") });
      expect(await tipJar.getBalance()).to.equal(parseEther("0.05"));
    });

    it("accumulates multiple tips", async () => {
      await tipJar.connect(tipper).tip("first", { value: parseEther("0.01") });
      await tipJar.connect(other).tip("second", { value: parseEther("0.02") });
      expect(await tipJar.getBalance()).to.equal(parseEther("0.03"));
    });

    it("reverts with ZeroValue when msg.value is 0", async () => {
      await expect(
        tipJar.connect(tipper).tip("empty", { value: 0 })
      ).to.be.revertedWithCustomError(tipJar, "ZeroValue");
    });
  });

  describe("withdraw()", () => {
    it("allows owner to withdraw full balance", async () => {
      const amount = parseEther("0.1");
      await tipJar.connect(tipper).tip("thanks", { value: amount });

      const ownerBefore = await ethers.provider.getBalance(owner.address);
      const tx = await tipJar.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const ownerAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerAfter).to.equal(ownerBefore + amount - gasUsed);
      expect(await tipJar.getBalance()).to.equal(0n);
    });

    it("reverts with NotOwner when called by non-owner", async () => {
      await tipJar.connect(tipper).tip("tip", { value: parseEther("0.01") });
      await expect(
        tipJar.connect(other).withdraw()
      ).to.be.revertedWithCustomError(tipJar, "NotOwner");
    });

    it("reverts with InsufficientBalance when balance is zero", async () => {
      await expect(
        tipJar.connect(owner).withdraw()
      ).to.be.revertedWithCustomError(tipJar, "InsufficientBalance");
    });
  });
});

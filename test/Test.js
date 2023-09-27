const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { FEE, VRF_COORDINATOR, LINK_TOKEN, KEY_HASH } = require("../constants");

describe("ChainLink-VRF", async function () {
  async function preset() {
    const [owner, address1, address2] = await ethers.getSigners();
    const randomWinnerGame = await ethers.deployContract("RandomWinnerGame", [
      VRF_COORDINATOR,
      LINK_TOKEN,
      KEY_HASH,
      FEE,
    ]);

    return { owner, address1, address2, randomWinnerGame };
  }

  it("should not allow non-owner to startGame", async function () {
    const { address1, randomWinnerGame } = await loadFixture(preset);
    const fee = ethers.parseEther("0.01");
    await expect(
      randomWinnerGame.connect(address1).startGame(2, fee)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should not allow starting a game if one is already running", async function () {
    const { owner, randomWinnerGame } = await loadFixture(preset);
    const fee = ethers.parseEther("0.01");
    await randomWinnerGame.connect(owner).startGame(2, fee);
    await expect(
      randomWinnerGame.connect(owner).startGame(2, fee)
    ).to.be.revertedWith("Game is currently running");
  });

  it("should not allow creating a game with maxPlayers equal to 0", async function () {
    const { owner, randomWinnerGame } = await loadFixture(preset);
    const fee = ethers.parseEther("0.01");
    await expect(
      randomWinnerGame.connect(owner).startGame(0, fee)
    ).to.be.revertedWith(
      "You cannot create a game with max players limit equal 0"
    );
  });

  it("should not allow joining a game if it hasn't started", async function () {
    const { address1, randomWinnerGame } = await loadFixture(preset);
    await expect(
      randomWinnerGame.connect(address1).joinGame()
    ).to.be.revertedWith("Game has not been started yet");
  });

  it("should not allow joining a game with incorrect entry fee", async function () {
    const { owner, address1, randomWinnerGame } = await loadFixture(preset);
    const fee = ethers.parseEther("0.01");
    const badFee = ethers.parseEther("0.02");
    await randomWinnerGame.connect(owner).startGame(2, fee);
    await expect(
      randomWinnerGame.connect(address1).joinGame({ value: badFee })
    ).to.be.revertedWith("Value sent is not equal to entryFee");
  });

  // it("should not allow joining a game when Game has not been started yet", async function () {
  //   const { owner, address1, address2, randomWinnerGame } = await loadFixture(
  //     preset
  //   );
  //   const fee = ethers.parseEther("0.01");
  //   await randomWinnerGame.connect(owner).startGame(2, fee);
  //   await randomWinnerGame.connect(owner).joinGame({ value: fee });
  //   await randomWinnerGame.connect(address1).joinGame({ value: fee });

  //   await expect(
  //     randomWinnerGame.connect(address2).joinGame({ value: fee })
  //   ).to.be.revertedWith("Game has not been started yet");
  //   expect(await randomWinnerGame.getGameStarted()).to.be.true;
  // });

  //   it("should allow joining a game and select a winner", async function () {
  //     const { owner, address1, address2, randomWinnerGame } = await loadFixture(
  //       preset
  //     );
  //     const fee = ethers.parseEther("0.01");
  //     await randomWinnerGame.startGame(2, fee);
  //     await randomWinnerGame.connect(address1).joinGame({ value: fee });
  //     await randomWinnerGame.connect(address2).joinGame({ value: fee });

  //     const tx = await randomWinnerGame.connect(owner).getRandomWinner();
  //     const { events } = await tx.wait();

  //     expect(events[0].event).to.equal("GameEnded");
  //     const winner = events[0].args.winner;
  //     expect([address1, address2]).to.include(winner);
  //   });

  //   it("should send winnings to the winner", async function () {
  //     const { owner, address1, address2, randomWinnerGame } = await loadFixture(
  //       preset
  //     );
  //     const fee = ethers.parseEther("0.01");
  //     await randomWinnerGame.startGame(2, fee);
  //     await randomWinnerGame.connect(address1).joinGame();
  //     await randomWinnerGame.connect(address2).joinGame();

  //     const initialBalance = await ethers.provider.getBalance(owner.address);

  //     const tx = await randomWinnerGame.connect(owner).getRandomWinner();
  //     const { events } = await tx.wait();

  //     const finalBalance = await ethers.provider.getBalance(owner.address);

  //     expect(finalBalance.gt(initialBalance)).to.be.true;
  //   });
});

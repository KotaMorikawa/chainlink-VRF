const hre = require("hardhat");
require("dotenv").config({ path: ".env" });
const { FEE, VRF_COORDINATOR, LINK_TOKEN, KEY_HASH } = require("../constants");

const main = async () => {
  const randomWinnerGame = await hre.ethers.deployContract("RandomWinnerGame", [
    VRF_COORDINATOR,
    LINK_TOKEN,
    KEY_HASH,
    FEE,
  ]);

  await randomWinnerGame.waitForDeployment();

  console.log("Verify Contract Address: ", randomWinnerGame.target);

  console.log("Sleeping....");

  await sleep(30 * 1000);

  await hre.run("verify:verify", {
    address: randomWinnerGame.target,
    constructorArguments: [VRF_COORDINATOR, LINK_TOKEN, KEY_HASH, FEE],
  });
};

const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.env.exit(1);
  });

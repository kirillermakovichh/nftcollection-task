const hre = require("hardhat");
//npx hardhat run scripts/deploy.js --network sepolia
// 0x9E86541d82B874E0d813d1b0a90e2B1c80f4c1E5
//npx hardhat verify 0x9E86541d82B874E0d813d1b0a90e2B1c80f4c1E5 --network sepolia "KErmakovich" "KE" "https://data.com/my-collection"
async function main() {
  const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
  const nftColl = await NFTCollection.deploy(
    "KErmakovich",
    "KE",
    "https://data.com/my-collection"
  );

  await nftColl.deployed();

  console.log(`Deployed to: ${nftColl.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

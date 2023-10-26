const { ethers } = require("hardhat");
//White list addresses
//["0xde2f1eaafcfc10f39e35385e6c35e46f55776f77","0x21c1c4469dc281fb086350801df418bbc37a3173","0x120212c1f712f8C7ad3590BF82139849c810236C",]

//White list root
// 0x4142d58fc55b360739e8e3157c1ec98c358cc8772824cb873d5d72cc59ace474

//Deploy
//npx hardhat run scripts/deploy.js --network sepolia

//Verify
//npx hardhat verify 0xeC1a181BaDB8f35583fC60BF12a2ae5e054eeb98 --network sepolia "0x4142d58fc55b360739e8e3157c1ec98c358cc8772824cb873d5d72cc59ace474"
async function main() {
  const NFTCollection = await ethers.deployContract("NFTCollection", [
    "0x4142d58fc55b360739e8e3157c1ec98c358cc8772824cb873d5d72cc59ace474",
  ]);
  await NFTCollection.waitForDeployment();

  console.log(`Deployed to ${NFTCollection.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

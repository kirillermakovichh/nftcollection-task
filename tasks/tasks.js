const { task } = require("hardhat/config");

//npx hardhat deploy --network localhost
task("deploy", "Deploy contract").setAction(async (taskArgs, { ethers }) => {
  const [owner] = await ethers.getSigners();

  const NFTCollection = await ethers.getContractFactory("NFTCollection");
  const nftColl = await NFTCollection.connect(owner).deploy(
    "KErmakovich",
    "KE",
    "https://data.com/my-collection"
  );
  await nftColl.deployed();
  console.log("Greeter deployed to: ", nftColl.address);
});

//npx hardhat addtowhitelist --addresses "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,0x70997970C51812dc3A010C7d01b50e0d17dc79C8" --network localhost
task("addtowhitelist", "Add addresses to the whitelist")
  .addParam("addresses", "The addresses to add to the whitelist")
  .setAction(async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );

    const addrArr = taskArgs.addresses.split(",");
    const txWhiteList = await nftColl.addToWhiteList(addrArr);
    await txWhiteList.wait();
    console.log("Addresses added to the whitelist successfully");
    console.log(
      `${addrArr[0]} in whiteList? ${await nftColl.whiteList(addrArr[0])}`
    );
  });

//npx hardhat singlemint --fee 300 --network localhost
task("singlemint", "Mint a single NFT")
  .addParam("fee", "The fee numerator for the royalty")
  .setAction(async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );

    //called by owner (he's in whiteList)
    const txSingleMint = await nftColl.singleMint(taskArgs.fee);
    await txSingleMint.wait();

    console.log("NFT minted successfully.");
    console.log(`Current token ID: ${(await nftColl._tokenIDs()) - 1}`);
  });

//npx hardhat singlemintbyuser --fee 300 --network localhost
task("singlemintbyuser", "Mint a single NFT")
  .addParam("fee", "The fee numerator for the royalty")
  .setAction(async (taskArgs, { ethers }) => {
    const [owner, admin, user] = await ethers.getSigners();
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );

    //called by owner (he's in whiteList)
    const txSingleMint = await nftColl.connect(user).singleMint(taskArgs.fee, {
      value: ethers.utils.parseEther("0.01"),
    });
    await txSingleMint.wait();

    console.log("NFT minted successfully.");
    console.log(`Current token ID: ${(await nftColl._tokenIDs()) - 1}`);
  });

//npx hardhat multiplemint --numtokens 3 --fee 300 --network localhost
task("multiplemint", "Mint multiple NFTs")
  .addParam("numtokens", "The number of NFTs to mint")
  .addParam("fee", "The fee numerator for the royalty")
  .setAction(async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );

    //called by owner (he's in whiteList)
    const tx = await nftColl.multipleMint(taskArgs.numtokens, taskArgs.fee);
    await tx.wait();

    console.log(`Successfully minted ${taskArgs.numtokens} NFTs`);
    console.log(`Current token ID: ${(await nftColl._tokenIDs()) - 1}`);
  });

//npx hardhat removefromwhitelist --addresses "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" --network localhost
task("removefromwhitelist", "Remove addresses from the whitelist")
  .addParam("addresses", "The addresses to remove from the whitelist")
  .setAction(async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );

    const addrArr = taskArgs.addresses.split(",");
    const txRemoveFromWhiteList = await nftColl.removeFromwhiteList(addrArr);
    await txRemoveFromWhiteList.wait();

    console.log("Addresses removed from the whitelist successfully");
    console.log(
      `${addrArr[0]} in whiteList? ${await nftColl.whiteList(addrArr[0])}`
    );
  });

//npx hardhat sendtoken --to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --tokenid 0 --network localhost
task("sendtoken", "Send an NFT to an address")
  .addParam("to", "The address to send the NFT to")
  .addParam("tokenid", "The ID of the NFT to send")
  .setAction(async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );

    const txSendtoken = await nftColl.sendToken(taskArgs.to, taskArgs.tokenid);
    await txSendtoken.wait();
    console.log("NFT sent successfully");
    console.log(await nftColl.ownerOf(taskArgs.tokenid));
  });

//npx hardhat togglemintpause --network localhost
task("togglemintpause", "Toggle the mint pause").setAction(
  async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    const txToggleMintPause = await nftColl.toggleMintPause();
    await txToggleMintPause.wait();
    console.log("Mint pause toggled successfully");
    console.log(`Paused: ${await nftColl.mintPaused()}`);
  }
);

//npx hardhat changeowner --newowner 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --network localhost
task("changeowner", "Change the owner of the contract")
  .addParam("newowner", "The address of the new owner")
  .setAction(async (taskArgs, { ethers }) => {
    const [owner, admin] = await ethers.getSigners();
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    const txChangeOwner = await nftColl.changeOwner(taskArgs.newowner);
    await txChangeOwner.wait();
    console.log("Owner changed successfully");
    console.log(`New owner: ${await nftColl.owner()}`);
  });

//npx hardhat withdraw --network localhost
task("withdraw", "Withdraw the contract balance").setAction(
  async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    const txWithdraw = await nftColl.withdraw();
    await txWithdraw.wait();
    console.log("Contract balance withdrawn successfully");
    console.log(
      `Contract balance: ${await ethers.provider.getBalance(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
      )}`
    );
  }
);

//npx hardhat settokenuri --tokenid 5 --tokenuri "https://data.com/my-collection/5" --network localhost
task("settokenuri", "Set the URI of an NFT")
  .addParam("tokenid", "The ID of the NFT to set the URI for")
  .addParam("tokenuri", "The URI to set for the NFT")
  .setAction(async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    const txSetTokenURI = await nftColl.setTokenURI(
      taskArgs.tokenid,
      taskArgs.tokenuri
    );
    await txSetTokenURI.wait();
    console.log("NFT URI set successfully");
    console.log(`NFT URI: ${await nftColl.getTokenURI(taskArgs.tokenid)}`);
  });

//npx hardhat gettokenuri --tokenid 5 --network localhost
task("gettokenuri", "Get the URI of an NFT")
  .addParam("tokenid", "The ID of the NFT to get the URI for")
  .setAction(async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    const URI = await nftColl.getTokenURI(taskArgs.tokenid);
    console.log(`NFT URI: ${URI}`);
  });

//npx hardhat setcontracturi --contracturi "https://data.com/my-new-collection" --network localhost
task("setcontracturi", "Set the contract URI")
  .addParam("contracturi", "The URI to set for the contract")
  .setAction(async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    const txSetContractURI = await nftColl.setContractURI(taskArgs.contracturi);
    await txSetContractURI.wait();

    console.log("Contract URI set successfully");
    console.log(`New contract URI: ${await nftColl.contractURI()}`);
  });

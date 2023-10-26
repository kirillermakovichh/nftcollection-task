const { task } = require("hardhat/config");

//npx hardhat deploy --root 0xd4453790033a2bd762f526409b7f358023773723d9e9bc42487e4996869162b6 --network localhost
task("deploy", "Deploy contract")
  .addParam("root", "The root of whitelist addressess tree")
  .setAction(async (taskArgs, { ethers }) => {
    const nftColl = await ethers.deployContract("NFTCollection", [
      taskArgs.root,
    ]);

    await nftColl.waitForDeployment();
    console.log("NFTCollection deployed to: ", nftColl.target);
  });

// npx hardhat mint --network localhost --quantity 10 0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0 0x7e0eefeb2d8740528b8f598997a219669f0842302d3c573e9bb7262be3387e63
task("mint", "Mint NFTs")
  .addParam("quantity", "The amount of tokens to mint")
  .addVariadicPositionalParam("proof", "Proof that address is whitelisted")
  .setAction(async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );

    const tx = await nftColl.mint(taskArgs.proof, taskArgs.quantity);
    await tx.wait();

    console.log(`Successfully minted ${taskArgs.quantity} NFTs`);
  });

//npx hardhat sendtoken --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --tokenid 0 --network localhost
task("sendtoken", "Send an NFT to an address")
  .addParam("from", "The owner of NFT")
  .addParam("to", "The address to send the NFT to")
  .addParam("tokenid", "The ID of the NFT to send")
  .setAction(async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );

    const txSendtoken = await nftColl.sendToken(
      taskArgs.from,
      taskArgs.to,
      taskArgs.tokenid
    );
    await txSendtoken.wait();
    console.log("NFT sent successfully");
    console.log("New owner: ", await nftColl.ownerOf(taskArgs.tokenid));
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
    console.log(`Is paused: ${await nftColl.mintPaused()}`);
  }
);

//npx hardhat changeowner --newowner 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --network localhost
task("changeowner", "Change the owner of the contract")
  .addParam("newowner", "The address of the new owner")
  .setAction(async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    const txChangeOwner = await nftColl.changeOwner(taskArgs.newowner);
    await txChangeOwner.wait();
    console.log("Owner changed successfully");
    console.log(`New owner: ${await nftColl.owner()}`);
  });

//npx hardhat updateroot --root 0x12014c768bd10562acd224ac6fb749402c37722fab384a6aecc8f91aa7dc51cf --network localhost
task("updateroot", "Update root of the white list")
  .addParam("root", "New root")
  .setAction(async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    const tx = await nftColl.updateRoot(taskArgs.root);
    await tx.wait();
    console.log("Root was updated successfully");
    console.log(`New root: ${await nftColl.whiteListAddressRoot()}`);
  });

//npx hardhat deposit --network localhost
task("deposit", "Update root of the white list").setAction(
  async (taskArgs, { ethers }) => {
    const [owner] = await ethers.getSigners();
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    const tx = await owner.sendTransaction({
      to: nftColl.target,
      value: ethers.parseEther("1.0"), // Sends exactly 1.0 ether
    });

    await tx.wait();
    console.log(
      "Contract balance: ",
      await ethers.provider.getBalance(nftColl.target)
    );
  }
);

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
      "Contract balance: ",
      await ethers.provider.getBalance(nftColl.target)
    );
    console.log(
      "Owner balance: ",
      await ethers.provider.getBalance(await nftColl.owner())
    );
  }
);

//npx hardhat contractinfo --network localhost
task("contractinfo", "Get contract information").setAction(
  async (taskArgs, { ethers }) => {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = NFTCollection.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    const [
      name,
      symbol,
      _baseURI,
      _nextTokenId,
      owner,
      mintPaused,
      contractBalance,
    ] = await nftColl.getContractInfo();

    console.log("Name: ", name);
    console.log("Symbol: ", symbol);
    console.log("BaseUri: ", _baseURI);
    console.log("Current Token ID: ", _nextTokenId);
    console.log("Owner: ", owner);
    console.log("Is paused: ", mintPaused);
    console.log("Contract balance: ", contractBalance);
  }
);

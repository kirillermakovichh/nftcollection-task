const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  treeRoot,
  ownerHexProof,
  user0HexProof,
  user1HexProof,
  user2HexProof,
  newTreeRoot,
} = require("./merkleTree.js");

const ownerQuantity = 2;
const user1Quantity = 3;
const notUserQuantity = 10000;

describe("NFTCollection", function () {
  async function deploy() {
    const [owner, user0, user1, user2, notUser] = await ethers.getSigners();

    const nftColl = await ethers.deployContract("NFTCollection", [treeRoot]);

    await nftColl.waitForDeployment();

    return { nftColl, owner, user0, user1, user2, notUser };
  }
  //0xd4453790033a2bd762f526409b7f358023773723d9e9bc42487e4996869162b6
  describe("Check initial values", function () {
    it.only("should sets values correctly", async function () {
      const { owner, user0, user1, nftColl } = await loadFixture(deploy);
      const [, , _baseURI, _nextTokenId, , mintPaused, addressBalance] =
        await nftColl.getContractInfo();

      // console.log(ownerHexProof);
      console.log("NEW", newTreeRoot);

      expect(nftColl.target).to.be.properAddress;
      expect(await nftColl.owner()).to.eq(owner.address);

      expect(await nftColl.MAX_TOKENS_SUPPLY()).to.eq(10000);
      expect(await nftColl.PRICE()).to.eq(ethers.parseEther("0.01"));
      expect(_nextTokenId).to.eq(0);
      expect(mintPaused).to.be.false;

      expect(await nftColl.name()).to.eq("KErmakovich");
      expect(await nftColl.symbol()).to.eq("KE");
      expect(_baseURI).to.eq("ipfs://my-collection/");
      expect(addressBalance).to.eq(0);
    });
  });

  describe("mint()", function () {
    it("should mint token by the OWNER correctly", async function () {
      const { nftColl, owner, user0, user1, user2 } = await loadFixture(deploy);

      const txMintByOwner = await nftColl
        .connect(owner)
        .mint(ownerHexProof, ownerQuantity);
      await txMintByOwner.wait();

      const [, , , _nextTokenId, , ,] = await nftColl.getContractInfo();

      expect(_nextTokenId).to.eq(ownerQuantity);
      expect(await nftColl.ownerOf(0)).to.eq(owner.address);
      expect(await nftColl.ownerOf(1)).to.eq(owner.address);
    });

    it("should mint token by WHITELISTED person correctly", async function () {
      const { nftColl, owner, user0, user1, user2 } = await loadFixture(deploy);

      const txMintByUser1 = await nftColl
        .connect(user1)
        .mint(user1HexProof, user1Quantity);
      await txMintByUser1.wait();

      const [, , , _nextTokenId, , ,] = await nftColl.getContractInfo();

      expect(_nextTokenId).to.eq(user1Quantity);
      expect(await nftColl.ownerOf(0)).to.eq(user1.address);
      expect(await nftColl.ownerOf(1)).to.eq(user1.address);

      await expect(txMintByUser1)
        .to.emit(nftColl, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, user1Quantity - 1);
    });

    it("should mint MAX_TOKENS_SUPPLY by NOT WHITELISTED person correctly", async function () {
      const { nftColl, owner, user0, user1, user2, notUser } =
        await loadFixture(deploy);

      const txMintByNotUser = await nftColl
        .connect(notUser)
        .mint(user1HexProof, notUserQuantity, {
          value: ethers.parseEther("0.01") * BigInt(notUserQuantity),
        });
      await txMintByNotUser.wait();

      const [, , , _nextTokenId, , ,] = await nftColl.getContractInfo();

      expect(_nextTokenId).to.eq(notUserQuantity);
      expect(await nftColl.ownerOf(0)).to.eq(notUser.address);
      expect(await nftColl.ownerOf(9999)).to.eq(notUser.address);

      await expect(txMintByNotUser)
        .to.emit(nftColl, "Transfer")
        .withArgs(ethers.ZeroAddress, notUser.address, notUserQuantity - 1);
    });

    it("should revert with 'Exceeds maximum tokens'", async function () {
      const { nftColl, owner, user0, user1, user2 } = await loadFixture(deploy);

      const maxSupply = await nftColl.MAX_TOKENS_SUPPLY();

      const txMintByOwner = nftColl
        .connect(owner)
        .mint(ownerHexProof, maxSupply + 1n);

      await expect(txMintByOwner).to.be.revertedWith("Exceeds maximum tokens");
    });

    it("should revert with 'Minting is paused'", async function () {
      const { nftColl, owner, user0, user1, user2 } = await loadFixture(deploy);

      const txPause = await nftColl.toggleMintPause();
      await txPause.wait();

      const txMintByOwner = nftColl
        .connect(owner)
        .mint(ownerHexProof, ownerQuantity);

      await expect(txMintByOwner).to.be.revertedWith("Minting is paused");
    });

    it("should revert with 'Ether value sent is not correct'", async function () {
      const { nftColl, owner, user0, user1, user2, notUser } =
        await loadFixture(deploy);

      const txMintByNotUser = nftColl
        .connect(notUser)
        .mint(user1HexProof, user1Quantity, { value: 0 });

      await expect(txMintByNotUser).to.be.revertedWith(
        "Ether value sent is not correct"
      );
    });
  });

  describe("toggleMintPause()", function () {
    it("should pause mint correctly", async function () {
      const { nftColl, owner, user0, user1, user2 } = await loadFixture(deploy);
      const txToggleMintPause = await nftColl.connect(owner).toggleMintPause();
      await txToggleMintPause.wait();

      expect(await nftColl.mintPaused()).to.be.true;
    });

    it("should revert if called not by the owner", async function () {
      const { nftColl, owner, user0, user1, user2, notUser } =
        await loadFixture(deploy);

      const txToggleMintPause = nftColl.connect(user0).toggleMintPause();

      await expect(txToggleMintPause).to.be.revertedWithCustomError(
        nftColl,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("changeOwner()", function () {
    it("should change owner correctly", async function () {
      const { nftColl, owner, user0, user1, user2 } = await loadFixture(deploy);

      const txChangeOwner = await nftColl.changeOwner(user0.address);
      await txChangeOwner.wait();

      expect(await nftColl.owner()).to.eq(user0.address);
    });

    it("should revert if called not by the owner", async function () {
      const { nftColl, owner, user0, user1, user2 } = await loadFixture(deploy);

      const txChangeOwner = nftColl.connect(user0).changeOwner(user0.address);

      await expect(txChangeOwner).to.be.revertedWithCustomError(
        nftColl,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("updateRoot()", function () {
    it("should update root correctly", async function () {
      const { nftColl, owner, user0, user1, user2 } = await loadFixture(deploy);

      const txUpdateRoot = await nftColl.connect(owner).updateRoot(newTreeRoot);
      await txUpdateRoot.wait();

      expect(await nftColl.whiteListAddressRoot()).to.eq(newTreeRoot);
    });

    it("should revert if called not by the owner", async function () {
      const { nftColl, owner, user0, user1, user2, notUser } =
        await loadFixture(deploy);

      const txUpdateRoot = nftColl.connect(user0).updateRoot(newTreeRoot);

      await expect(txUpdateRoot).to.be.revertedWithCustomError(
        nftColl,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("withdraw()", function () {
    it("should withdraws correctly", async function () {
      const { nftColl, owner, user0, user1, user2, notUser } =
        await loadFixture(deploy);

      const txMintByNotUser = await nftColl
        .connect(notUser)
        .mint(user1HexProof, notUserQuantity, {
          value: ethers.parseEther("0.01") * BigInt(notUserQuantity),
        });
      await txMintByNotUser.wait();

      const contractBalance = await ethers.provider.getBalance(nftColl.target);

      const txWithdraw = await nftColl.connect(owner).withdraw();
      await txWithdraw.wait();

      await expect(txWithdraw).to.changeEtherBalance(owner, contractBalance);
    });

    it("should revert with 'Nothing to withdraw'", async function () {
      const { nftColl, owner, user0, user1, user2, notUser } =
        await loadFixture(deploy);

      const txWithdraw = nftColl.connect(owner).withdraw();

      await expect(txWithdraw).to.be.revertedWith("Nothing to withdraw");
    });

    it("should revert if called not by the owner", async function () {
      const { nftColl, owner, user0, user1, user2, notUser } =
        await loadFixture(deploy);

      const txWithdraw = nftColl.connect(user0).withdraw();

      await expect(txWithdraw).to.be.revertedWithCustomError(
        nftColl,
        "OwnableUnauthorizedAccount"
      );
    });
  });
});

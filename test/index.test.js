const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTCollection", function () {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function deploy() {
    const [owner, admin, user] = await ethers.getSigners();
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const nftColl = await NFTCollection.deploy(
      "KErmakovich",
      "KE",
      "https://data.com/my-collection"
    );
    await nftColl.deployed();

    return {
      owner,
      admin,
      user,
      nftColl,
    };
  }
  describe("Check initial values", function () {
    it("should sets values correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      expect(nftColl.address).to.be.properAddress;
      expect(await nftColl.owner()).to.eq(owner.address);

      expect(await nftColl.name()).to.eq("KErmakovich");
      expect(await nftColl.symbol()).to.eq("KE");
      expect(await nftColl.contractURI()).to.eq(
        "https://data.com/my-collection"
      );

      expect(await nftColl.MAX_TOKENS()).to.eq(10000);
      expect(await nftColl.PRICE()).to.eq(ethers.utils.parseEther("0.01"));
      expect(await nftColl._tokenIDs()).to.eq(0);
    });
  });

  describe("addToWhiteList()", function () {
    it("should sets addresses correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const txWhiteList = await nftColl.addToWhiteList([
        owner.address,
        admin.address,
      ]);
      await txWhiteList.wait();

      expect(await nftColl.whiteList(owner.address)).to.eq(true);
      expect(await nftColl.whiteList(admin.address)).to.eq(true);
    });

    it("should revert with 'Can't be 0 address'", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      await expect(
        nftColl.addToWhiteList([owner.address, ethers.constants.AddressZero])
      ).to.be.revertedWith("Can't be 0 address");
    });

    it("should revert with 'Ownable: caller is not the owner'", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      await expect(
        nftColl.connect(admin).addToWhiteList([owner.address, admin.address])
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("singleMint()", function () {
    it("should mint token buy the whiteList person correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const txWhiteList = await nftColl.addToWhiteList([
        owner.address,
        admin.address,
      ]);
      await txWhiteList.wait();

      const feeNumerator = 300;
      const salePrice = 10000;

      const txSingleMint = await nftColl.singleMint(feeNumerator);
      await txSingleMint.wait();

      const tokenId = Number(await nftColl._tokenIDs());

      expect(tokenId).to.eq(1);
      expect(await nftColl.ownerOf(0)).to.eq(owner.address);

      const [receiver, royaltyAmount] = await nftColl.royaltyInfo(
        tokenId - 1,
        salePrice
      );

      expect(receiver).to.eq(owner.address);
      expect(royaltyAmount).to.eq((salePrice * feeNumerator) / 10000);
    });

    it("should mint token buy the user correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const feeNumerator = 300;
      const salePrice = 10000;

      const txSingleMint = await nftColl
        .connect(user)
        .singleMint(feeNumerator, { value: ethers.utils.parseEther("0.01") });
      await txSingleMint.wait();

      //Change user balance buy 0.01 ether after minting
      await expect(() => txSingleMint).to.changeEtherBalance(
        user,
        ethers.utils.parseEther("-0.01")
      );

      const tokenId = Number(await nftColl._tokenIDs());

      expect(tokenId).to.eq(1);
      expect(await nftColl.ownerOf(0)).to.eq(user.address);

      const [receiver, royaltyAmount] = await nftColl.royaltyInfo(
        tokenId - 1,
        salePrice
      );

      expect(receiver).to.eq(user.address);
      expect(royaltyAmount).to.eq((salePrice * feeNumerator) / 10000);
    });

    it("should emit 'NFTMinted'", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const txWhiteList = await nftColl.addToWhiteList([
        owner.address,
        admin.address,
      ]);
      await txWhiteList.wait();

      const feeNumerator = 100;

      const tokenId = Number(await nftColl._tokenIDs());

      const txSingleMint = await nftColl.singleMint(feeNumerator);
      await txSingleMint.wait();

      await expect(txSingleMint)
        .to.emit(nftColl, "NFTMinted")
        .withArgs(tokenId, owner.address, feeNumerator);
    });

    it("should revert with 'Minting is paused", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const feeNumerator = 100;

      const pause = await nftColl.toggleMintPause();
      await pause.wait();

      await expect(nftColl.singleMint(feeNumerator)).to.be.revertedWith(
        "Minting is paused"
      );
    });

    it("should revert with 'Ether value sent is not correct", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const feeNumerator = 100;

      await expect(
        nftColl.connect(user).singleMint(feeNumerator)
      ).to.be.revertedWith("Ether value sent is not correct");
    });
  });

  describe("multipleMint()", function () {
    it("should mint token buy the whiteList person correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const txWhiteList = await nftColl.addToWhiteList([
        owner.address,
        admin.address,
      ]);
      await txWhiteList.wait();

      const feeNumerator = 300;
      const salePrice = 10000;

      const txmultipleMint = await nftColl.multipleMint(2, feeNumerator);
      await txmultipleMint.wait();

      const tokenId = Number(await nftColl._tokenIDs());

      expect(tokenId).to.eq(2);
      expect(await nftColl.ownerOf(0)).to.eq(owner.address);
      expect(await nftColl.ownerOf(1)).to.eq(owner.address);

      const [receiver, royaltyAmount] = await nftColl.royaltyInfo(
        tokenId - 1,
        salePrice
      );

      expect(receiver).to.eq(owner.address);
      expect(royaltyAmount).to.eq((salePrice * feeNumerator) / 10000);
    });

    it("should mint token buy the user correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const feeNumerator = 300;
      const salePrice = 10000;

      const txmultipleMint = await nftColl
        .connect(user)
        .multipleMint(2, feeNumerator, {
          value: ethers.utils.parseEther("0.02"),
        });
      await txmultipleMint.wait();

      //Change user balance buy 0.01 * 2 ether after minting
      await expect(() => txmultipleMint).to.changeEtherBalance(
        user,
        ethers.utils.parseEther("-0.02")
      );

      const tokenId = Number(await nftColl._tokenIDs());

      expect(tokenId).to.eq(2);
      expect(await nftColl.ownerOf(0)).to.eq(user.address);
      expect(await nftColl.ownerOf(1)).to.eq(user.address);

      const [receiver, royaltyAmount] = await nftColl.royaltyInfo(
        tokenId - 1,
        salePrice
      );

      expect(receiver).to.eq(user.address);
      expect(royaltyAmount).to.eq((salePrice * feeNumerator) / 10000);
    });

    it("should emit 'NFTMinted'", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const txWhiteList = await nftColl.addToWhiteList([
        owner.address,
        admin.address,
      ]);
      await txWhiteList.wait();

      const feeNumerator = 100;

      const tokenId = Number(await nftColl._tokenIDs());

      const txmultipleMint = await nftColl.multipleMint(2, feeNumerator);
      await txmultipleMint.wait();

      await expect(txmultipleMint)
        .to.emit(nftColl, "NFTMinted")
        .withArgs(tokenId, owner.address, feeNumerator);
    });

    it("should revert with 'Minting is paused", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const feeNumerator = 100;

      const pause = await nftColl.toggleMintPause();
      await pause.wait();

      await expect(nftColl.multipleMint(2, feeNumerator)).to.be.revertedWith(
        "Minting is paused"
      );
    });

    it("should revert with 'Ether value sent is not correct", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const feeNumerator = 100;

      await expect(
        nftColl.connect(user).multipleMint(2, feeNumerator)
      ).to.be.revertedWith("Ether value sent is not correct");
    });
  });

  describe("removeFromwhiteList()", function () {
    it("should remove persom from whiteList correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const txWhiteList = await nftColl.addToWhiteList([
        owner.address,
        admin.address,
        user.address,
      ]);
      await txWhiteList.wait();

      const txRemove = await nftColl.removeFromwhiteList([
        admin.address,
        user.address,
      ]);
      await txRemove.wait();

      expect(await nftColl.whiteList(admin.address)).to.eq(false);
      expect(await nftColl.whiteList(user.address)).to.eq(false);
    });

    it("should revert with 'Ownable: caller is not the owner'", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      await expect(
        nftColl
          .connect(admin)
          .removeFromwhiteList([owner.address, admin.address])
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("sendToken()", function () {
    it("should send token correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const tokenId = Number(await nftColl._tokenIDs());

      const txWhiteList = await nftColl.addToWhiteList([
        owner.address,
        admin.address,
      ]);
      await txWhiteList.wait();

      const feeNumerator = 300;

      const txSingleMint = await nftColl.singleMint(feeNumerator);
      await txSingleMint.wait();

      const txSend = await nftColl.sendToken(admin.address, tokenId);
      await txSend.wait();

      expect(await nftColl.ownerOf(tokenId)).to.eq(admin.address);
    });

    it("should revert with 'Ownable: caller is not the owner'", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const tokenId = Number(await nftColl._tokenIDs());

      const txWhiteList = await nftColl.addToWhiteList([
        owner.address,
        admin.address,
      ]);
      await txWhiteList.wait();

      const feeNumerator = 300;

      const txSingleMint = await nftColl.singleMint(feeNumerator);
      await txSingleMint.wait();

      await expect(
        nftColl.connect(admin).sendToken(admin.address, tokenId)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should revert with 'Token does not exist'", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      await expect(nftColl.sendToken(admin.address, 0)).to.be.revertedWith(
        "Token does not exist"
      );
    });
  });

  describe("changeOwner()", function () {
    it("should change owner correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const txChange = await nftColl.changeOwner(user.address);
      await txChange.wait();

      expect(await nftColl.owner()).to.eq(user.address);
    });

    it("should revert with 'Ownable: caller is not the owner'", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      await expect(
        nftColl.connect(user).changeOwner(user.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("withdraw()", function () {
    it("should withdraws correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);
      const feeNumerator = 300;
      const salePrice = 10000;

      const txSingleMint = await nftColl
        .connect(user)
        .singleMint(feeNumerator, { value: ethers.utils.parseEther("0.01") });
      await txSingleMint.wait();

      const txWithdraw = await nftColl.withdraw();
      await txWithdraw.wait();

      await expect(txWithdraw).to.changeEtherBalance(
        owner,
        ethers.utils.parseEther("0.01")
      );
    });

    it("should revert with 'Nothing to withdraw'", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      await expect(nftColl.withdraw()).to.be.revertedWith(
        "Nothing to withdraw"
      );
    });

    it("should revert with 'Ownable: caller is not the owner'", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      await expect(nftColl.connect(admin).withdraw()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("setTokenURI()", function () {
    it("should set tokenURI correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const txWhiteList = await nftColl.addToWhiteList([
        owner.address,
        admin.address,
      ]);
      await txWhiteList.wait();
      const tokenId = await nftColl._tokenIDs();

      const feeNumerator = 300;
      const tokenURI = `https://data.com/my-collection/${tokenId}`;

      const txSingleMint = await nftColl.singleMint(feeNumerator);
      await txSingleMint.wait();

      const txSet = await nftColl.setTokenURI(0, tokenURI);
      await txSet.wait();

      expect(await nftColl.tokenURI(tokenId)).to.eq(tokenURI);
    });

    it("should revert with 'You're not an owner of the token'", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const txWhiteList = await nftColl.addToWhiteList([
        owner.address,
        admin.address,
      ]);
      await txWhiteList.wait();
      const tokenId = await nftColl._tokenIDs();

      const feeNumerator = 300;
      const tokenURI = `https://data.com/my-collection/${tokenId}`;

      const txSingleMint = await nftColl.singleMint(feeNumerator);
      await txSingleMint.wait();

      await expect(
        nftColl.connect(user).setTokenURI(0, tokenURI)
      ).to.be.revertedWith("You're not an owner of the token");
    });
  });

  describe("getTokenURI()", function () {
    it("should get tokenURI correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const txWhiteList = await nftColl.addToWhiteList([
        owner.address,
        admin.address,
      ]);
      await txWhiteList.wait();
      const tokenId = await nftColl._tokenIDs();

      const feeNumerator = 300;
      const tokenURI = `https://data.com/my-collection/${tokenId}`;

      const txSingleMint = await nftColl.singleMint(feeNumerator);
      await txSingleMint.wait();

      const txSet = await nftColl.setTokenURI(0, tokenURI);
      await txSet.wait();

      expect(await nftColl.getTokenURI(0)).to.eq(tokenURI);
    });
  });

  describe("setContractURI()", function () {
    it("should get contractURI correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const txSetContractURI = await nftColl.setContractURI("https://some.com");
      await txSetContractURI.wait();

      expect(await nftColl.contractURI()).to.eq("https://some.com");
    });

    it("should revert with 'Ownable: caller is not the owner'", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      await expect(
        nftColl.connect(admin).setContractURI("https://some.com")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("getContractInfo()", function () {
    it("should get contract info correctly", async function () {
      const { owner, admin, user, nftColl } = await loadFixture(deploy);

      const [
        name,
        symbol,
        _tokenIDs,
        mintPaused,
        ownerAddr,
        balance,
        contractURI,
      ] = await nftColl.getContractInfo();

      expect(name).to.eq(await nftColl.name());
      expect(symbol).to.eq(await nftColl.symbol());
      expect(_tokenIDs).to.eq(await nftColl._tokenIDs());
      expect(mintPaused).to.eq(false);
      expect(ownerAddr).to.eq(owner.address);
      expect(balance).to.eq(0);
      expect(contractURI).to.eq(await nftColl.contractURI());
    });

    describe("getContractInfo()", function () {
      it("should get contract info correctly", async function () {
        const { owner, admin, user, nftColl } = await loadFixture(deploy);

        expect(await nftColl.supportsInterface(0x49064906)).to.eq(true);
      });
    });
  });
});

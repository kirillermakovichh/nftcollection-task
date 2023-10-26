const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

const whiteListAddresses = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", //owner
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", //user0
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", //user2
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906", //user2
];

const newWhiteListAddresses = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", //owner
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", //user0
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906", //user2
];

const leaves = whiteListAddresses.map((x) => keccak256(x));
const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

const treeRoot = `0x${merkleTree.getRoot().toString("hex")}`;

const newLeaves = newWhiteListAddresses.map((x) => keccak256(x));
const newMerkleTree = new MerkleTree(newLeaves, keccak256, { sortPairs: true });

const newTreeRoot = `0x${newMerkleTree.getRoot().toString("hex")}`;

const ownerLeave = leaves[0];
const user0Leave = leaves[1];
const user1Leave = leaves[2];
const user2Leave = leaves[3];

const ownerHexProof = merkleTree.getHexProof(ownerLeave);
const user0HexProof = merkleTree.getHexProof(user0Leave);
const user1HexProof = merkleTree.getHexProof(user1Leave);
const user2HexProof = merkleTree.getHexProof(user2Leave);

module.exports = {
  treeRoot,
  ownerHexProof,
  user0HexProof,
  user1HexProof,
  user2HexProof,
  newTreeRoot,
};

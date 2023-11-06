// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title NFTCollection
 * @dev This contract allows users to mint NFTs. It also implements a whitelist using Merkle trees.
 */
contract NFTCollection is ERC721A, Ownable {
    uint256 public constant MAX_TOKENS_SUPPLY = 10000;
    uint256 public constant PRICE = 0.01 ether;

    bool public mintPaused;

    bytes32 public whiteListAddressRoot;

    constructor(
        bytes32 _whiteListAddressRoot
    ) ERC721A("KErmakovich", "KE") Ownable(_msgSenderERC721A()) {
        whiteListAddressRoot = _whiteListAddressRoot;
    }

    /**
     * @dev Mints NFTs to the caller.
     * @param proof The proof of inclusion for the whitelist.
     * @param quantity The number of tokens to mint.
     */
    function mint(bytes32[] calldata proof, uint256 quantity) public payable {
        bytes32 leaf = keccak256(abi.encodePacked(_msgSenderERC721A()));
        if (!MerkleProof.verify(proof, whiteListAddressRoot, leaf)) {
            require(
                msg.value >= PRICE * quantity,
                "Ether value sent is not correct"
            );
        }

        require(!mintPaused, "Minting is paused");

        require(
            _nextTokenId() + quantity <= MAX_TOKENS_SUPPLY,
            "Exceeds maximum tokens"
        );

        _safeMint(_msgSenderERC721A(), quantity);
    }

    /**
     * @dev Toggles the mint pause state.
     */
    function toggleMintPause() external onlyOwner {
        mintPaused = !mintPaused;
    }

    /**
     * @dev Transfers the contract ownership to a specified address.
     * @param newOwner The address to transfer the ownership to.
     */
    function changeOwner(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
    }

    /**
     * @dev Updates the merkle root for the whitelist.
     * @param _whiteListAddressRoot The new merkle root.
     */
    function updateRoot(bytes32 _whiteListAddressRoot) external onlyOwner {
        whiteListAddressRoot = _whiteListAddressRoot;
    }

    /**
     * @dev Withdraws the contract balance to the contract owner.
     */
    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "Nothing to withdraw");
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    /**
     * @dev Returns the base URI for the NFT metadata.
     *
     * @return baseURI:
     */
    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://my-collection/";
    }

    /**
     * @dev Retrieves information about the contract.
     *
     * @return A tuple containing the following contract information:
     * - name: The name of the token.
     * - symbol: The symbol of the token.
     * - baseURI: The base URI of the token.
     * - nextTokenId: The next token ID to be minted.
     * - owner: The address of the contract owner.
     * - mintPaused: A boolean indicating whether minting is paused.
     * - balance: The balance of Ether held by the contract.
     */
    function getContractInfo()
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            address,
            bool,
            uint256
        )
    {
        return (
            name(),
            symbol(),
            _baseURI(),
            _nextTokenId(),
            owner(),
            mintPaused,
            address(this).balance
        );
    }

    receive() external payable {}
}

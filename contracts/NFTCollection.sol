// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title NFTCollection
 * @notice A contract for managing an NFT collection
 * @dev This contract is an ERC721 token with URI storage and ownership functionality
 * @dev It also implements the ERC2981 standard for royalty fees
 */
contract NFTCollection is ERC2981, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIDs;

    string public contractURI;
    uint256 public constant MAX_TOKENS = 10000;
    uint256 public constant PRICE = 0.01 ether;

    bool public mintPaused;

    mapping(address => bool) public whiteList;

    event NFTMinted(uint id, address minter, uint fee);

    /**
     * @dev Constructor function for the NFTCollection contract.
     * @param _name The name of the ERC721 token.
     * @param _symbol The symbol of the ERC721 token.
     * @param _contractURI The URI for the contract metadata.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _contractURI
    ) ERC721(_name, _symbol) {
        contractURI = _contractURI;
    }

    /**
     * @notice Mint a single NFT token.
     * @param feeNumerator The royalty fee numerator for the token.
     * @dev The caller must send enough ether to cover the minting cost unless they are whitelisted
     * @dev The minting process will fail if the maximum number of tokens has been reached
     * @dev Emits an NFTMinted event for the minted token
     */
    function singleMint(uint96 feeNumerator) public payable {
        require(!mintPaused, "Minting is paused");
        require(_tokenIDs.current() <= MAX_TOKENS, "Exceeds maximum tokens");
        if (!whiteList[msg.sender]) {
            require(msg.value >= PRICE, "Ether value sent is not correct");
        }

        uint256 tokenId = _tokenIDs.current();

        _setTokenRoyalty(tokenId, msg.sender, feeNumerator);
        _safeMint(msg.sender, tokenId);

        emit NFTMinted(tokenId, msg.sender, feeNumerator);

        _tokenIDs.increment();
    }

    /**
     * @notice Mint multiple NFT tokens.
     * @param numTokens The number of tokens to mint.
     * @param feeNumerator The royalty fee numerator for each minted token.
     * @dev The caller must send enough ether to cover the minting cost for each token unless they are whitelisted
     * @dev The minting process will fail if the maximum number of tokens has been reached
     * @dev Emits an NFTMinted event for each minted token
     */
    function multipleMint(
        uint256 numTokens,
        uint96 feeNumerator
    ) public payable {
        require(!mintPaused, "Minting is paused");
        require(_tokenIDs.current() <= MAX_TOKENS, "Exceeds maximum tokens");
        if (!whiteList[msg.sender]) {
            require(
                msg.value >= PRICE * numTokens,
                "Ether value sent is not correct"
            );
        }

        for (uint256 i = 0; i < numTokens; i++) {
            uint256 tokenId = _tokenIDs.current();

            _setTokenRoyalty(tokenId, msg.sender, feeNumerator);
            _safeMint(msg.sender, tokenId);

            emit NFTMinted(tokenId, msg.sender, feeNumerator);

            _tokenIDs.increment();
        }
    }

    /**
     * @notice Add addresses to the whitelist.
     * @param addresses The addresses to add to the whitelist.
     * @dev Only the contract owner can add addresses to the whitelist
     * @dev The address cannot be the zero address
     */
    function addToWhiteList(address[] calldata addresses) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            require(addresses[i] != address(0), "Can't be 0 address");
            whiteList[addresses[i]] = true;
        }
    }

    /**
     * @notice Remove addresses from the whitelist.
     * @param addresses The addresses to remove from the whitelist.
     * @dev Only the contract owner can remove addresses from the whitelist
     */
    function removeFromwhiteList(
        address[] calldata addresses
    ) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whiteList[addresses[i]] = false;
        }
    }

    /**
     * @notice Send a token to another address.
     * @param to The address to send the token to.
     * @param tokenId The ID of the token to send.
     * @dev Only the contract owner can send tokens
     * @dev The token must exist
     */
    function sendToken(address to, uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _safeTransfer(owner(), to, tokenId, "");
    }

    /**
     * @notice Toggle the minting pause state.
     * @dev Only the contract owner can toggle the minting pause state
     */
    function toggleMintPause() public onlyOwner {
        mintPaused = !mintPaused;
    }

    /**
     * @notice Change the contract owner.
     * @param newOwner The address of the new owner.
     * @dev Only the contract owner can change the contract owner
     */
    function changeOwner(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
    }

    /**
     * @notice Withdraw the contract balance.
     * @dev Only the contract owner can withdraw the contract balance
     * @dev The contract balance must be greater than 0
     */
    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "Nothing to withdraw");
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @notice Set the token URI.
     * @param tokenId The ID of the token to set the URI for.
     * @param URI The URI to set for the token.
     * @dev Only the token owner can set the token URI
     */
    function setTokenURI(uint256 tokenId, string calldata URI) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "You're not an owner of the token"
        );
        _setTokenURI(tokenId, URI);
    }

    /**
     * @notice Get the token URI.
     * @param tokenId The ID of the token to get the URI for.
     * @return The URI of the token.
     */
    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        return tokenURI(tokenId);
    }

    /**
     * @notice Set the contract URI.
     * @param _contractURI The URI to set for the contract.
     * @dev Only the contract owner set the contract URI
     */
    function setContractURI(string calldata _contractURI) public onlyOwner {
        contractURI = _contractURI;
    }

    /**
     * @notice Get the contract information.
     * @return The name, symbol, current token count, mint pause state, owner address, contract balance, and contract URI.
     */
    function getContractInfo()
        external
        view
        returns (
            string memory,
            string memory,
            uint256,
            bool,
            address,
            uint256,
            string memory
        )
    {
        return (
            name(),
            symbol(),
            _tokenIDs.current(),
            mintPaused,
            owner(),
            address(this).balance,
            contractURI
        );
    }

    /**
     * @notice Check if the contract supports an interface.
     * @param interfaceId The interface ID to check.
     * @return True if the contract supports the interface, false otherwise.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC2981, ERC721URIStorage) returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId ||
            interfaceId == bytes4(0x49064906) ||
            super.supportsInterface(interfaceId);
    }
}

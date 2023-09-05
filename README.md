# Blockchain Task

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

The **tokenURI** is a function specified in the ERC-721 standard for non-fungible tokens (NFTs) on the Ethereum blockchain. The purpose of the tokenURI function is to return a Uniform Resource Identifier (URI) for a given token ID, which can be a URL or other form of URI that points to a JSON file. This JSON file is expected to hold metadata about the token.

The **contractURI** is a function specified in the ERC-721 standard for non-fungible tokens (NFTs) on the Ethereum blockchain. The purpose of the contractURI function is to return a Uniform Resource Identifier (URI) for current contract, which can be a URL or other form of URI that points to a JSON file. This JSON file is expected to hold metadata about the contract.

The **royaltyInfo** returns how much royalty is owed and to whom, based on a sale price that may be denominated in any unit of exchange. The royalty amount is denominated and should be paid in that same unit of exchange.

# Solidity API

## NFTCollection

A contract for managing an NFT collection

_This contract is an ERC721 token with URI storage and ownership functionality
It also implements the ERC2981 standard for royalty fees_

### \_tokenIDs

```solidity
struct Counters.Counter _tokenIDs
```

### contractURI

```solidity
string contractURI
```

### MAX_TOKENS

```solidity
uint256 MAX_TOKENS
```

### PRICE

```solidity
uint256 PRICE
```

### mintPaused

```solidity
bool mintPaused
```

### whiteList

```solidity
mapping(address => bool) whiteList
```

### NFTMinted

```solidity
event NFTMinted(uint256 id, address minter, uint256 fee)
```

### constructor

```solidity
constructor(string _name, string _symbol, string _contractURI) public
```

_Constructor function for the NFTCollection contract._

#### Parameters

| Name          | Type   | Description                        |
| ------------- | ------ | ---------------------------------- |
| \_name        | string | The name of the ERC721 token.      |
| \_symbol      | string | The symbol of the ERC721 token.    |
| \_contractURI | string | The URI for the contract metadata. |

### singleMint

```solidity
function singleMint(uint96 feeNumerator) public payable
```

Mint a single NFT token.

_The caller must send enough ether to cover the minting cost unless they are whitelisted
The minting process will fail if the maximum number of tokens has been reached
Emits an NFTMinted event for the minted token_

#### Parameters

| Name         | Type   | Description                              |
| ------------ | ------ | ---------------------------------------- |
| feeNumerator | uint96 | The royalty fee numerator for the token. |

### multipleMint

```solidity
function multipleMint(uint256 numTokens, uint96 feeNumerator) public payable
```

Mint multiple NFT tokens.

_The caller must send enough ether to cover the minting cost for each token unless they are whitelisted
The minting process will fail if the maximum number of tokens has been reached
Emits an NFTMinted event for each minted token_

#### Parameters

| Name         | Type    | Description                                      |
| ------------ | ------- | ------------------------------------------------ |
| numTokens    | uint256 | The number of tokens to mint.                    |
| feeNumerator | uint96  | The royalty fee numerator for each minted token. |

### addToWhiteList

```solidity
function addToWhiteList(address[] addresses) public
```

Add addresses to the whitelist.

_Only the contract owner can add addresses to the whitelist
The address cannot be the zero address_

#### Parameters

| Name      | Type      | Description                            |
| --------- | --------- | -------------------------------------- |
| addresses | address[] | The addresses to add to the whitelist. |

### removeFromwhiteList

```solidity
function removeFromwhiteList(address[] addresses) public
```

Remove addresses from the whitelist.

_Only the contract owner can remove addresses from the whitelist_

#### Parameters

| Name      | Type      | Description                                 |
| --------- | --------- | ------------------------------------------- |
| addresses | address[] | The addresses to remove from the whitelist. |

### sendToken

```solidity
function sendToken(address to, uint256 tokenId) public
```

Send a token to another address.

_Only the contract owner can send tokens
The token must exist_

#### Parameters

| Name    | Type    | Description                       |
| ------- | ------- | --------------------------------- |
| to      | address | The address to send the token to. |
| tokenId | uint256 | The ID of the token to send.      |

### toggleMintPause

```solidity
function toggleMintPause() public
```

Toggle the minting pause state.

_Only the contract owner can toggle the minting pause state_

### changeOwner

```solidity
function changeOwner(address newOwner) public
```

Change the contract owner.

_Only the contract owner can change the contract owner_

#### Parameters

| Name     | Type    | Description                   |
| -------- | ------- | ----------------------------- |
| newOwner | address | The address of the new owner. |

### withdraw

```solidity
function withdraw() public
```

Withdraw the contract balance.

_Only the contract owner can withdraw the contract balance
The contract balance must be greater than 0_

### setTokenURI

```solidity
function setTokenURI(uint256 tokenId, string URI) public
```

Set the token URI.

_Only the token owner can set the token URI_

#### Parameters

| Name    | Type    | Description                             |
| ------- | ------- | --------------------------------------- |
| tokenId | uint256 | The ID of the token to set the URI for. |
| URI     | string  | The URI to set for the token.           |

### getTokenURI

```solidity
function getTokenURI(uint256 tokenId) public view returns (string)
```

Get the token URI.

#### Parameters

| Name    | Type    | Description                             |
| ------- | ------- | --------------------------------------- |
| tokenId | uint256 | The ID of the token to get the URI for. |

#### Return Values

| Name | Type   | Description           |
| ---- | ------ | --------------------- |
| [0]  | string | The URI of the token. |

### setContractURI

```solidity
function setContractURI(string _contractURI) public
```

Set the contract URI.

_Only the contract owner set the contract URI_

#### Parameters

| Name          | Type   | Description                      |
| ------------- | ------ | -------------------------------- |
| \_contractURI | string | The URI to set for the contract. |

### getContractInfo

```solidity
function getContractInfo() external view returns (string, string, uint256, bool, address, uint256, string)
```

Get the contract information.

#### Return Values

| Name | Type    | Description                                                                                                 |
| ---- | ------- | ----------------------------------------------------------------------------------------------------------- |
| [0]  | string  | The name, symbol, current token count, mint pause state, owner address, contract balance, and contract URI. |
| [1]  | string  |                                                                                                             |
| [2]  | uint256 |                                                                                                             |
| [3]  | bool    |                                                                                                             |
| [4]  | address |                                                                                                             |
| [5]  | uint256 |                                                                                                             |
| [6]  | string  |                                                                                                             |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

Check if the contract supports an interface.

#### Parameters

| Name        | Type   | Description                |
| ----------- | ------ | -------------------------- |
| interfaceId | bytes4 | The interface ID to check. |

#### Return Values

| Name | Type | Description                                                   |
| ---- | ---- | ------------------------------------------------------------- |
| [0]  | bool | True if the contract supports the interface, false otherwise. |

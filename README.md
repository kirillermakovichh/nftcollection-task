The tokenURI is a function specified in the ERC-721 standard for non-fungible tokens (NFTs) on the Ethereum blockchain. The purpose of the tokenURI function is to return a Uniform Resource Identifier (URI) for a given token ID, which can be a URL or other form of URI that points to a JSON file. This JSON file is expected to hold metadata about the token.

The royaltyInfo returns how much royalty is owed and to whom, based on a sale price that may be denominated in any unit of exchange. The royalty amount is denominated and should be paid in that same unit of exchange.

# Solidity API

## NFTCollection

_This contract allows users to mint NFTs. It also implements a whitelist using Merkle trees._

### MAX_TOKENS_SUPPLY

```solidity
uint256 MAX_TOKENS_SUPPLY
```

### PRICE

```solidity
uint256 PRICE
```

### mintPaused

```solidity
bool mintPaused
```

### whiteListAddressRoot

```solidity
bytes32 whiteListAddressRoot
```

### constructor

```solidity
constructor(bytes32 _whiteListAddressRoot) public
```

### mint

```solidity
function mint(bytes32[] proof, uint256 quantity) public payable
```

_Mints NFTs to the caller._

#### Parameters

| Name     | Type      | Description                               |
| -------- | --------- | ----------------------------------------- |
| proof    | bytes32[] | The proof of inclusion for the whitelist. |
| quantity | uint256   | The number of tokens to mint.             |

### sendToken

```solidity
function sendToken(address from, address to, uint256 tokenId) external
```

_Sends a token from the caller to a specified address._

#### Parameters

| Name    | Type    | Description                         |
| ------- | ------- | ----------------------------------- |
| from    | address | The address to send the token from. |
| to      | address | The address to send the token to.   |
| tokenId | uint256 | The ID of the token to send.        |

### toggleMintPause

```solidity
function toggleMintPause() external
```

_Toggles the mint pause state._

### changeOwner

```solidity
function changeOwner(address newOwner) external
```

_Transfers the contract ownership to a specified address._

#### Parameters

| Name     | Type    | Description                               |
| -------- | ------- | ----------------------------------------- |
| newOwner | address | The address to transfer the ownership to. |

### updateRoot

```solidity
function updateRoot(bytes32 _whiteListAddressRoot) external
```

_Updates the merkle root for the whitelist._

#### Parameters

| Name                   | Type    | Description          |
| ---------------------- | ------- | -------------------- |
| \_whiteListAddressRoot | bytes32 | The new merkle root. |

### withdraw

```solidity
function withdraw() external
```

_Withdraws the contract balance to the contract owner._

### \_baseURI

```solidity
function _baseURI() internal pure returns (string)
```

_Returns the base URI for the NFT metadata._

#### Return Values

| Name | Type   | Description |
| ---- | ------ | ----------- |
| [0]  | string | baseURI:    |

### getContractInfo

```solidity
function getContractInfo() public view returns (string, string, string, uint256, address, bool, uint256)
```

_Retrieves information about the contract._

#### Return Values

| Name | Type    | Description                                                                                                                                                                                                                                                                                                            |
| ---- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [0]  | string  | - name: The name of the token.      |
| [1]  | string  | - symbol: The symbol of the token.                                                                                                                                                                                                                                                                                                                    |
| [2]  | string  | - baseURI: The base URI of the token.                                                                                                                                                                                                                                                                                                                       |
| [3]  | uint256 | - nextTokenId: The next token ID to be minted.                                                                                                                                                                                                                                                                                                                 |
| [4]  | address | - owner: The address of the contract owner.                                                                                                                                                                                                                                                                                                                      |
| [5]  | bool    | - mintPaused: A boolean indicating whether minting is paused.                                                                                                                                                                                                                                                                                                                      |
| [6]  | uint256 | - balance: The balance of Ether held by the contract.                                                                                                                                                                                                                                                                                                                      |

### receive

```solidity
receive() external payable
```

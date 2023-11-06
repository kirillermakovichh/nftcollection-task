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

| Name        | Type    | Description                                     |
| ----------- | ------- | ----------------------------------------------- |
| name        | string  | The name of the token.                          |
| symbol      | string  | The symbol of the token.                        |
| baseURI     | string  | The base URI of the token.                      |
| nextTokenId | uint256 | The next token ID to be minted.                 |
| owner       | address | The address of the contract owner.              |
| mintPaused  | bool    | A boolean indicating whether minting is paused. |
| balance     | uint256 | The balance of Ether held by the contract.      |

### receive

```solidity
receive() external payable
```

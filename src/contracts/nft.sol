// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


/* Secure NFT contract for digital asset registration.
 * Features:
 *   - ERC721
 *   - URI storage (IPFS)
 *   - Creator royalties (EIP-2981)
 *   - Pausable & Ownable 
 * Dependencies: solidity 0.8.x+, openzeppelin v5.x */


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract NonFungibleToken is ERC721URIStorage, ERC2981, Pausable, Ownable {


    uint256 private _nextTokenId;


    mapping(uint256 => address) public creators;


    event AssetMinted(
      uint256 indexed tokenId,
      address indexed creator,
      string tokenURI
    )


    constructor(address admin) 
        ERC721("NonFungibleToken", "NFT") 
        Ownable(admin) 
    { }


    /* Mint non-fungible-token representing digital asset
     *   image/music stored on IPFS
     *   royaltyFee = in basis points (500 = 5%) */
    function mintAsset(
        string memory tokenURI,
        uint96 royaltyFee
    ) external whenNotPaused returns (uint256) {
        require(royaltyFee <= 1000, "Royalty too high (max 10%)");

        uint256 tokenId = _nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        creators[tokenId] = msg.sender;

        _setTokenRoyalty(tokenId, msg.sender, royaltyFee);

        emit AssetMinted(tokenId, msg.sender, tokenURI);
        return tokenId;
    }


    function pause() external onlyOwner {
        _pause();
    }


    function unpause() external onlyOwner {
        _unpause();
    }


    /* Required by solidity
     * @dev Checks if the contract supports a specific interface (ERC721, ERC2981, etc.) */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

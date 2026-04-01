// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


/* Secure NFT Marketplace
 * Features:
 *   - List NFT
 *   - Buy NFT
 *   - Cancel listing
 *   - Marketplace fee
 *   - Reentrancy protection 
 * Dependencies: solidity 0.8.x+, openzeppelin v5.x */


import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";


contract NonFungibleTokenMarketplace is ReentrancyGuard, Ownable, Pausable {


    uint256 public marketplaceFee = 50;
    uint256 public constant txFeeBase = 10000;


    struct Listing {
        address seller;
        uint256 price;
    }


    mapping(address => mapping(uint256 => Listing)) public listings;

    
    event NonFungibleTokenListed(
        address nft, 
        uint256 tokenId, 
        address seller, 
        uint256 price
    );

    event NonFungibleTokenSold(
        address nft, 
        uint256 tokenId, 
        address buyer, 
        uint256 price
    );

    event ListingCancelled(
        address nft, 
        uint256 tokenId
    );


    constructor(address admin) 
        Ownable(admin)
    { }


    function list(address nft, uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be positive");

        IERC721 token = IERC721(nft);
        require(token.ownerOf(tokenId) == msg.sender, "Authentication failure: not owner of the token");

        require(
            token.getApproved(tokenId) == address(this) ||
            token.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        listings[nft][tokenId] = Listing(msg.sender, price);
        emit NonFungibleTokenListed(nft, tokenId, msg.sender, price);
    }


    function cancel(address nft, uint256 tokenId) external {
        Listing memory listing = listings[nft][tokenId];
        require(listing.seller == msg.sender, "Authentication failure: not seller of the list");

        delete listings[nft][tokenId];
        emit ListingCancelled(nft, tokenId);
    }


    function _safeTransferEth(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Transfer failed");
    }


    function buy(address nft, uint256 tokenId)
        external
        payable
        nonReentrant
    {
        Listing memory listing = listings[nft][tokenId];
        require(listing.price > 0, "Invalid input: token not listed");
        require(msg.value >= listing.price, "Payment failure: insufficient funds");

        delete listings[nft][tokenId];

        uint256 fee = (msg.value * marketplaceFee) / txFeeBase;
        uint256 sellerAmount = msg.value - fee;

        try IERC2981(nft).royaltyInfo(tokenId, msg.value) returns (address royaltyReceiver, uint256 royaltyAmount) {
            if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                sellerAmount -= royaltyAmount;
                _safeTransferEth(royaltyReceiver, royaltyAmount);
            }
        } catch {}

        _safeTransferEth(listing.seller, sellerAmount);

        IERC721(nft).safeTransferFrom(listing.seller, msg.sender, tokenId);

        emit NonFungibleTokenSold(nft, tokenId, msg.sender, msg.value);
    }


    function pause() external onlyOwner {
        _pause();
    }


    function unpause() external onlyOwner {
        _unpause();
    }


    function updateMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= txFeeBase, "New fee exceeding the limit");
        marketplaceFee = newFee;
    }


    function withdrawFees() external onlyOwner {
        _safeTransferEth(owner(), address(this).balance);
    }

}

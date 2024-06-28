// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// errors
error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOwner();
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NftMarketplace__NoProceeds();
error NftMarketplace__TransferFailed();

/// @title Nft marketplace
/// @author Michał Wojtalczyk
/// @notice It's jus the basic marketplace contract
contract NftMarketplace is ReentrancyGuard {
    /// @notice Data of listed nft
    /// @custom:price Price of the nft
    /// @custom:seller Seller address
    struct Listing {
        uint256 price;
        address seller;
    }

    /// @notice Event emits when item is listed on marketplace
    /// @param seller Seller address
    /// @param nftAddress Address of the nft
    /// @param tokenId Id of the nft
    /// @param price Pprice of the nft
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    /// @notice Event emits when nft is bought on marketplace
    /// @param buyer Buyer address
    /// @param nftAddress Address of the nft
    /// @param tokenId Id of the nft
    /// @param price Pprice of the nft
    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    /// @notice Event emits when listed nft is cancelled from marketplace
    /// @param seller Seller address
    /// @param nftAddress Address of the nft
    /// @param tokenId Id of the nft
    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    /// @dev NFT address -> NFT tokenId -> Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;

    /// @dev Seller address -> Amount earned
    mapping(address => uint256) private s_proceeds;

    /// @notice Check if nft is not listed
    /// @param _nftAddress Address of the nft
    /// @param _tokenId Id of the nft
    /// @param _owner Nft owner address
    /// @dev Revert when nft is already listed
    modifier notListed(
        address _nftAddress,
        uint256 _tokenId,
        address _owner
    ) {
        Listing memory listing = s_listings[_nftAddress][_tokenId];
        if (listing.price > 0)
            revert NftMarketplace__AlreadyListed(_nftAddress, _tokenId);
        _;
    }

    /// @notice Check if spender is owner of the nft
    /// @param _nftAddress Address of the nft
    /// @param _tokenId Id of the nft
    /// @param _spender Spender address
    /// @dev Revert when spender is not an owner of the nft
    modifier isOwner(
        address _nftAddress,
        uint256 _tokenId,
        address _spender
    ) {
        IERC721 nft = IERC721(_nftAddress);
        address owner = nft.ownerOf(_tokenId);
        if (_spender != owner) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }

    /// @notice Check if nft is already listed
    /// @param _nftAddress Address of the nft
    /// @param _tokenId Id of the nft
    /// @dev Revert when nft is not listed
    modifier isListed(address _nftAddress, uint256 _tokenId) {
        Listing memory listing = s_listings[_nftAddress][_tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(_nftAddress, _tokenId);
        }
        _;
    }

    /// @notice List nft on the marketplace
    /// @param _nftAddress Address of the nft
    /// @param _tokenId Id of the nft
    /// @param _price Price of the nft
    /// @dev Revert when nft is not approved or price is negative
    /// @dev Revert when price is negative
    function listItem(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    )
        external
        isOwner(_nftAddress, _tokenId, msg.sender)
        notListed(_nftAddress, _tokenId, msg.sender)
    {
        if (_price <= 0) revert NftMarketplace__PriceMustBeAboveZero();
        IERC721 nft = IERC721(_nftAddress);
        if (nft.getApproved(_tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }
        s_listings[_nftAddress][_tokenId] = Listing(_price, msg.sender);
        emit ItemListed(msg.sender, _nftAddress, _tokenId, _price);
    }

    /// @notice Buy nft on the marketplace
    /// @param _nftAddress Address of the nft
    /// @param _tokenId Id of the nft
    /// @dev Revert when value is below nft price
    /// @dev Can't re-entrant
    function buyItem(
        address _nftAddress,
        uint256 _tokenId
    ) external payable nonReentrant isListed(_nftAddress, _tokenId) {
        Listing memory listedItem = s_listings[_nftAddress][_tokenId];
        if (msg.value < listedItem.price) {
            revert NftMarketplace__PriceNotMet(
                _nftAddress,
                _tokenId,
                listedItem.price
            );
        }
        s_proceeds[listedItem.seller] += msg.value;
        delete (s_listings[_nftAddress][_tokenId]);
        IERC721(_nftAddress).safeTransferFrom(
            listedItem.seller,
            msg.sender,
            _tokenId
        );
        emit ItemBought(msg.sender, _nftAddress, _tokenId, listedItem.price);
    }

    /// @notice Cancel listing of the nft on the marketplace
    /// @param _nftAddress Address of the nft
    /// @param _tokenId Id of the nft
    function cancelListing(
        address _nftAddress,
        uint256 _tokenId
    )
        external
        isOwner(_nftAddress, _tokenId, msg.sender)
        isListed(_nftAddress, _tokenId)
    {
        delete (s_listings[_nftAddress][_tokenId]);
        emit ItemCanceled(msg.sender, _nftAddress, _tokenId);
    }

    /// @notice Update listing of the nft on the marketplace
    /// @param _nftAddress Address of the nft
    /// @param _tokenId Id of the nft
    /// @param _newPrice New price of the nft
    function updateListing(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _newPrice
    )
        external
        isListed(_nftAddress, _tokenId)
        isOwner(_nftAddress, _tokenId, msg.sender)
    {
        s_listings[_nftAddress][_tokenId].price = _newPrice;
        emit ItemListed(msg.sender, _nftAddress, _tokenId, _newPrice);
    }

    /// @notice Withdraw proceeds from the marketplace
    /// @dev Revert when sender has no proceeds
    /// @dev Revert when transfer proceeds failed
    /// @dev Can't re-entrant -> proceeds updated before transfer funds
    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketplace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NftMarketplace__TransferFailed();
        }
    }

    /// @notice Get listing of the nft on the marketplace
    /// @param _nftAddress Address of the nft
    /// @param _tokenId Id of the nft
    /// @return Listing item
    function getListing(
        address _nftAddress,
        uint256 _tokenId
    ) external view returns (Listing memory) {
        return s_listings[_nftAddress][_tokenId];
    }

    /// @notice Get proceeds from the marketplace
    /// @param _seller Seller Address
    /// @return Amount of available proceeds
    function getProceeds(address _seller) external view returns (uint256) {
        return s_proceeds[_seller];
    }
}

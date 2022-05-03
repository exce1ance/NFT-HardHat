//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ColeccionNFT3 is ERC721, Ownable {
    string public _baseURIextended; //private
    string public _baseURInotRevealed; //private
    uint256 public constant MAX_SUPPLY = 20;
    uint256 public constant MAX_PUBLIC_MINT = 2;
    uint256 public constant PRICE_PER_TOKEN = 0.001 ether;
    uint256 public tokenId;
    bool public revealed = false; //nada
    bool public whitelistIsActive = false; //nada
    bool public saleIsActive = false; //nada

    mapping(address => uint8) public _whiteList; //private

    constructor() ERC721("Yep", "Dude") {
        tokenId = 0;
    }

    function setWhitelist(address[] calldata addresses, uint8 numAllowedMint)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < addresses.length; i++) {
            _whiteList[addresses[i]] = numAllowedMint;
        }
    }

    function mintWhitelist(uint8 numberOfTokens) external payable {
        require(whitelistIsActive, "Whitelist is not active");
        require(
            numberOfTokens <= _whiteList[msg.sender],
            "Exceeded max available to purchase"
        );
        require(
            tokenId + numberOfTokens <= MAX_SUPPLY,
            "Purchase will exceed max supply"
        );
        require(
            PRICE_PER_TOKEN * numberOfTokens <= msg.value,
            "Ether value is not correct"
        );

        _whiteList[msg.sender] -= numberOfTokens;
        for (uint256 i = 0; i < numberOfTokens; i++) {
            _safeMint(msg.sender, tokenId + i);
        }
        tokenId = tokenId + numberOfTokens;
    }

    function mint(uint256 numberOfTokens) public payable {
        require(saleIsActive, "Sale is not active yet");
        require(
            numberOfTokens <= MAX_PUBLIC_MINT,
            "Exceeded max available to purchase"
        );
        require(
            tokenId + numberOfTokens <= MAX_SUPPLY,
            "Purchase will exceed max supply"
        );
        require(
            PRICE_PER_TOKEN * numberOfTokens <= msg.value,
            "Ether sent value is not correct"
        );

        for (uint256 i = 0; i < numberOfTokens; i++) {
            _safeMint(msg.sender, tokenId + i);
        }
        tokenId = tokenId + numberOfTokens;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (revealed == true) {
            return super.tokenURI(_tokenId);
        } else {
            return _baseURInotRevealed;
        }
    }

    function revealCollection() public onlyOwner {
        revealed = true;
    }

    function setBaseUriExtended(string memory baseURI_) external onlyOwner {
        _baseURIextended = baseURI_;
    }

    function setBaseUriNotRevealed(string memory baseURInotRevealed_)
        external
        onlyOwner
    {
        _baseURInotRevealed = baseURInotRevealed_;
    }

    function setWhitelistActive() external onlyOwner {
        whitelistIsActive = true;
    }

    function setSaleIsActive() public onlyOwner {
        saleIsActive = true;
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}

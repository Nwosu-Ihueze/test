// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "hardhat/console.sol";

contract TAW is Ownable, ReentrancyGuard, ERC721Enumerable {
  using Strings for uint256;

  using Counters for Counters.Counter;
 Counters.Counter private _tokenIds;

  string _baseTokenURI;

  //  _price is the price of one The Awakened Woman NFT
  uint256 public _price = 0.01 ether;

  // _paused is used to pause the contract in case of an emergency
  bool public _paused;

  // max number of The Awakened Woman
  uint256 public maxTokenIds = 5555;

  address nftowner = 0x1920FC6b2f0B4d741e1Bb7e15703f94Cd45C7f36;

  mapping(address => uint) myNFT;
  // event showNFT(address sender, uint256 tokenId);

//   // total number of tokenIds minted
//   uint256 public tokenIds;

//   // Address of Contract Owner
//   address payable owner = 0x1920FC6b2f0B4d741e1Bb7e15703f94Cd45C7f36;

  modifier onlyWhenNotPaused {
    require(!_paused, "Contract currently paused");
    _;
  }

    /// @notice Modifier Used To Restrict Access Of Certain Functions Only To Owner
  /// @dev Function Caller is checked against the owner of the contract  
    modifier nftOwner() {
      require(msg.sender == nftowner, "Only Owner Can Access This Function");
      _;
    }

        /**
         * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
         * name in our case is `The Awakened Woman` and symbol is `TAW`.
         * Constructor for TAW takes in the baseURI to set _baseTokenURI for the collection.
         */
        constructor (string memory baseURI) ERC721("The Awakened Woman", "TAW") {
            _baseTokenURI = baseURI;
        }

         function getTokenIdsMinted () external view returns (uint256) {
        return _tokenIds.current() - 1;
    }

        /**
        * @dev mint allows an user to mint 1 NFT per transaction.
        */
        function mint() public payable onlyWhenNotPaused nonReentrant {
          uint256 newItemId = _tokenIds.current();
            require(_tokenIds.current() < maxTokenIds, "Exceed maximum TAW supply");
            require(msg.value >= _price, "Ether sent is not correct");
            _tokenIds.increment();
            console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
            
           _safeMint(msg.sender, newItemId);
          //  emit showNFT(msg.sender, newItemId);
          myNFT[msg.sender] = newItemId;
        }

        /**
        * @dev _baseURI overides the Openzeppelin's ERC721 implementation which by default
        * returned an empty string for the baseURI
        */
        function _baseURI() internal view virtual override returns (string memory) {
            return _baseTokenURI;
        }

        /**
        * @dev tokenURI overides the Openzeppelin's ERC721 implementation for tokenURI function
        * This function returns the URI from where we can extract the metadata for a given tokenId
        */
        function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
            require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

            string memory baseURI = _baseURI();
            // Here it checks if the length of the baseURI is greater than 0, if it is return the baseURI and attach
            // the tokenId and `.json` to it so that it knows the location of the metadata json file for a given 
            // tokenId stored on IPFS
            // If baseURI is empty return an empty string
            return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
        }

        

        function reserveNFTs() public nftOwner {
           uint tokenIdsMinted = _tokenIds.current();
           require(tokenIdsMinted + 100 < maxTokenIds, "Not enough NFTs");
           for (uint i = 0; i < 100; i++) {
            mintSingleNFT();
           }

        }

        function mintSingleNFT() private {
            uint newTokenId = _tokenIds.current();
            _safeMint(msg.sender, newTokenId);
            _tokenIds.increment();
        }

        // function myNFT() public view returns(string[] memory){
        //   return showNFT[msg.sender];
        // }
        function viewNFT() public view returns(uint) {
          return myNFT[msg.sender];
        }

        /**
        * @dev setPaused makes the contract paused or unpaused
         */
        function setPaused(bool val) public onlyOwner {
            _paused = val;
        }

        /**
        * @dev withdraw sends all the ether in the contract 
        * to the owner of the contract
         */
        function withdraw() public nftOwner nonReentrant {
            address _owner = nftowner;
            uint256 amount = address(this).balance;
            (bool sent, ) =  _owner.call{value: amount}("");
            require(sent, "Failed to send Ether");
        }

         // Function to receive Ether. msg.data must be empty
        receive() external payable {}

        // Fallback function is called when msg.data is not empty
        fallback() external payable {}
}
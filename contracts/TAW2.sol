// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../legacy-contracts/ERC721A.sol";

contract TAW is Ownable, ReentrancyGuard, ERC721A {

  using Strings for uint256;

  // The next token ID to be minted.
  uint256 private _currentIndex = 1;

  string _baseTokenURI;

  //  _price is the price of one The Awakened Woman NFT
  uint256 public _price = 0.01 ether;

  // _paused is used to pause the contract in case of an emergency
  bool public _paused;

  // max number of The Awakened Woman
  uint256 public maxSupply = 5555;

  mapping(address => uint) myNFT;

  address nftowner = 0x767a246Ee829edCF48268695D77CeB49103B8EF3;

  /// @notice Modifier Used To Restrict Access Of Certain Functions Only To Owner
  /// @dev Function Caller is checked against the owner of the contract  
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

  constructor (string memory baseURI) ERC721A("The Awakened Woman", "TAW") {
    _baseTokenURI = baseURI;
  }

   //Returns starting tokenId
    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    /**
    * @dev setPaused makes the contract paused or unpaused
    */
    function setPaused(bool val) public onlyOwner {
      _paused = val;
    }


     function getMintedIds() external view returns(uint256) {
      return _totalMinted();
    }

    /**
    * @dev _baseURI overides the Openzeppelin's ERC721 implementation which by default
    * returned an empty string for the baseURI
    */
    function _baseURI() internal view virtual override returns (string memory) {
      return _baseTokenURI;
    }
    /**
    * @dev Returns the total number of tokens in existence.
    * Burned tokens will reduce the count.
    * To get the total number of tokens minted, please see {_totalMinted}.
    */
    function totalSupply() public view virtual override returns (uint256) {
      // Counter underflow is impossible as _burnCounter cannot be incremented
      // more than `_currentIndex - _startTokenId()` times.
      unchecked {
        return _currentIndex - _startTokenId();
      }
    }


    /**
    * @dev mint allows an user to mint max of 5 NFT.
    */
    function mint(uint256 quantity) external payable onlyWhenNotPaused nonReentrant {
      uint256 newItemId = _currentIndex;
        require(_currentIndex > totalSupply(), "Exceed maximum TAW supply");
        require(msg.value >= _price * quantity, "Ether sent is not correct");
        require(quantity <= 5);       
        _mint(msg.sender, quantity);
          _currentIndex += quantity;
          myNFT[msg.sender] = newItemId;
    }

     function viewNFT() public view returns(uint) {
          return myNFT[msg.sender];
        }

    function reserveNFTs() external nftOwner nonReentrant {
      require(totalSupply() < maxSupply - 100, "Action not completed");
            
      _mint(nftowner, 100);
        _currentIndex += 100;
    }

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

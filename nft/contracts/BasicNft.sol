// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    string public constant TOKEN_URI = "ipfs://foo.json";
    uint256 s_tokenCounter;

    constructor() ERC721("Dogie", "DOG") {}

    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
        return s_tokenCounter;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    // Returns a JSON with token metadata & attributes that may include an image url
    function tokenURI()
        public
        pure
        returns (
            //uint256 tokenId
            string memory
        )
    {
        return TOKEN_URI;
    }
}

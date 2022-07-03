// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './lib/AFacet.sol';
import './lib/LibA.sol';
import './FacetB.sol';


contract FacetA is AFacet {
  function read(string memory message) public view returns(string memory) {
    return FacetB(address(this)).foo(message);
  }

  function write(string memory message) public {
    LibA.data().message = message;
    FacetB(address(this)).bar(message);
  }
}

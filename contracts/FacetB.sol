// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './lib/AFacet.sol';
import './lib/LibB.sol';
import 'hardhat/console.sol';


contract FacetB is AFacet {
  function foo(string memory message) public view diamondInternal returns(string memory) {
    return message;
  }

  function bar(string memory message) external diamondInternal returns(string memory) {
    LibB.data().message = message;
    return message;
  }
}

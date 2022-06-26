// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './lib/AFacet.sol';
import './lib/LibA.sol';
import './FacetB.sol';
import 'hardhat/console.sol';


contract FacetA is AFacet {
  function foo(string memory message) public {
    console.log('A.foo/1: .');
    console.log('     message', message);
    console.log('        this', address(this));
    console.log('  msg.sender', msg.sender);

    LibA.Data storage ds = LibA.data();
    ds.message = message;

    console.log(' Calling FacetB.bar/1...');
    FacetB(address(this)).bar(message);

    console.log(' Calling FacetB.baz/1...');
    string memory result = FacetB(address(this)).baz(message);
    console.log('      result', result);
  }
}

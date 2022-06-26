// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './lib/AFacet.sol';
import './lib/LibB.sol';
import './FacetB.sol';
import 'hardhat/console.sol';


contract FacetB is AFacet {
  function bar(string memory message) external view diamondInternal {
    console.log('Facet.bar/0 called.');
    console.log('     message', message);
    console.log('        this', address(this));
    console.log('  msg.sender', msg.sender);
  }

  function baz(string memory message) external diamondInternal returns(string memory) {
    console.log('Facet.baz/1 called.');
    console.log('     message', message);
    console.log('        this', address(this));
    console.log('  msg.sender', msg.sender);
    
    LibB.Data storage ds = LibB.data();
    ds.message = message;

    return message;
  }
}

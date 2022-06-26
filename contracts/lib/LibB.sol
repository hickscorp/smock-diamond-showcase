// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library LibB {
  bytes32 internal constant STORAGE_SLOT = 0x6924ec6d6bac948c75e6be4051d114f7ae8eefb765fdc96e9c777617eba0c7b7;

  struct Data {
    string message;
  }

  function data()
      internal pure returns(Data storage s) {
    assembly {s.slot := STORAGE_SLOT}
  }
}

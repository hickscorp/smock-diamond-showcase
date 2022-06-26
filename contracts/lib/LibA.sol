// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library LibA {
  bytes32 internal constant STORAGE_SLOT = 0x06276927e65318e6d77a6ee7419b0306ff50a8f50a993a99935f0a7aca5ec39c;

  struct Data {
    string message;
  }

  function data()
      internal pure returns(Data storage s) {
    assembly {s.slot := STORAGE_SLOT}
  }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '../interfaces/IERC173.sol';
import '../lib/LibA.sol';

/**
* @dev This contract is a group of modifiers that can be used by any facets to guard against
*       certain permissions.
*/
abstract contract AFacet {
  /// Modifiers.

  /// @dev Ensures that a method can only be called by another facet of the same diamond.
  modifier diamondInternal() {
    require(msg.sender == address(this), 'Cannot be called directly');
    _;
  }

  /// @dev Ensures that a method can only be called by the owner of this diamond.
  modifier diamondOwner() {
    require(msg.sender == IERC173(address(this)).owner(), 'Can only be called by owner');
    _;
  }
}

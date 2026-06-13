// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title TipJar
/// @notice Accepts ETH tips with messages; owner can withdraw the accumulated balance.
contract TipJar is ReentrancyGuard {
    // Custom errors (cheaper than require strings) 
    error NotOwner();
    error ZeroValue();
    error InsufficientBalance();

    // Storage
    address public immutable owner;

    // Events 
    event NewTip(address indexed from, uint256 amount, string message);

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // External functions 

    /// @notice Send ETH with an optional message.
    /// @param message Freeform text attached to the tip.
    function tip(string calldata message) external payable {
        if (msg.value == 0) revert ZeroValue();
        emit NewTip(msg.sender, msg.value, message);
    }

    /// @notice Withdraw the entire contract balance to the owner.
    /// @dev Checks-Effects-Interactions: balance is "zeroed" via the full
    ///      transfer, so a re-entrant call finds no funds. ReentrancyGuard
    ///      adds a second layer of protection.
    function withdraw() external nonReentrant {
        if (msg.sender != owner) revert NotOwner();

        uint256 balance = address(this).balance;
        if (balance == 0) revert InsufficientBalance();

        // Effects: nothing to update in storage — balance lives in the EVM
        // Interactions: transfer last, after checks
        (bool ok, ) = owner.call{value: balance}("");
        require(ok, "transfer failed");
    }

    /// @notice Returns current contract balance.
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

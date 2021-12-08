// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './CrowdFundingWithDeadline.sol';

contract TestCrowdFundingWithDeadline is CrowdFundingWithDeadline {
    uint time; 

    constructor(
        string memory contractName,
        uint targetAmountETH,
        uint durationInMin, 
        address beneficiaryAddress
    )
        CrowdFundingWithDeadline(contractName, targetAmountETH, durationInMin, beneficiaryAddress) public
    {

    }

    function currentTime() internal view returns(uint) {
        // View means just for viewing purposes, doesn't change anything. 
        // Internal because only this contract can call on currentTime(), or parent. vs. private which means ONLY this contract. 
        // Smart contract relies on this method to get the current time
        return time;
    }

    function setCurrentTime(uint newTime) public {
        // Public because we want to call on this method from outside this contract. 
        time = newTime;
    }
}
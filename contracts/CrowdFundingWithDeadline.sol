// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CrowdFundingWithDeadline {
    enum State { Ongoing, Failed, Succeeded, PaidOut }

    string public name;
    uint public targetAmount; 
    uint public fundingDeadline; 
    // number of secs from Jan 1 1970
    address public beneficiary; 
    State public state;

    constructor(
        // initializing the smart contract, can only be done once
        string contractName,
        uint targetAmountETH,
        uint durationInMin, 
        address beneficiaryAddress    
    )
    public
    {
        name = contractName;
        targetAmount = targetAmountETH * 1 ether;
        // converts to Wei
        fundingDeadline = currentTime() + durationInMin * 1 minutes;
        // converts to seconds
        beneficiary = beneficiaryAddress;
        state = State.Ongoing;
        // if hadn't initialized above, would be: State state = State.Ongoing;
    }

    function currentTime() internal view returns(uint) {
        return now; 
        // returns the curent block time with the Now alias
    }
}
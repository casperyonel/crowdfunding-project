// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CrowdFundingWithDeadline {
    enum State { Ongoing, Failed, Succeeded, PaidOut }

    string public name;
    uint public targetAmount; 
    uint public fundingDeadline; 
    // Number of secs from Jan 1, 1970
    address public beneficiary; 
    State public state;

    mapping(address => uint) public amounts;
    // Tracks how much funds each address contributes to a campaign. used in Contribute() 
    bool public collected; 
    uint public totalCollected;

    modifier inState(State expectedState) {
        require(state == expectedState, "Invalid state");
        _;
    }

    constructor(
        // Initializing the smart contract, can only be executed once, is optional
        string memory contractName,
        uint targetAmountETH,
        uint durationInMin, 
        address beneficiaryAddress
    )
    {
        name = contractName; // so now can do contract.name.call() in testing to access this which was initialized in the constructor
        targetAmount = targetAmountETH * 1 ether;
        // converts to Wei from Eth
        fundingDeadline = currentTime() + durationInMin * 1 minutes;
        // converts to seconds
        // 0 + 10 (we created a contract with 10 mins in testing) * 60
        beneficiary = beneficiaryAddress;
        state = State.Ongoing;
        // if hadn't initialized above, would be: State state = State.Ongoing;
    }

    function contribute() public payable inState(State.Ongoing) {
    
        // It's payable because users should be able to send funds with this transaction. 
        // inState modifier is ensuring the contract is still in ongoing state, which means it can be contributed to.
        require(beforeDeadline(), "");
        amounts[msg.sender] += msg.value;
        // Using mapping with msg.sender as the key and wei as the value (uint in wei)
        // Since we use msg.sender and msg.value in this function, even though it's (), we're going to need to send address and value when testing. 
        totalCollected += msg.value;

        if (totalCollected >= targetAmount) {
            collected = true;
        }
    }

    function currentTime() internal view returns(uint) {
        return block.timestamp;
        // returns the curent block time with the Now alias
    }

    function finishCrowdFunding() public inState(State.Ongoing) {
        require(!beforeDeadline(), "");
        
        if (!collected) {
            state = State.Failed;
        } else {
            state = State.Succeeded;
        }
    }

    function beforeDeadline() public view returns(bool) {
        return currentTime() < fundingDeadline;
    }
}
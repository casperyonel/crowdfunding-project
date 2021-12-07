// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Utils.sol";

contract CrowdFundingWithDeadline {

    using Utils for *; // Using Utils library for all types.

    enum State { Ongoing, Failed, Succeeded, PaidOut }

    event CampaignFinished (
        address addr, 
        uint totalCollected,
        bool succeeded
    );

    string public name;
    uint public targetAmount; 
    uint public fundingDeadline; // Number of secs from Jan 1, 1970 
    address public beneficiary; 
    State public state;

    mapping(address => uint) public amounts;
    // Tracks how much funds each address contributes to a campaign. used in Contribute() 
    bool public collected; 
    uint public totalCollected;

    modifier inState(State expectedState) {
        require(state == expectedState, "Invalid state");
        _;
        // Expected state is argument and it's using the enum State so need State keyword in argument too. 
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
        targetAmount = Utils.etherToWei(targetAmountETH); // converts to Wei from Eth
        fundingDeadline = currentTime() + Utils.minutesToSeconds(durationInMin);
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

        emit CampaignFinished(this, totalCollected, collected); 
        // This keyword represents address of this contract. 
        // totalCollected represents amount of funds
        // Collected is boolean. 
    }

    function collect() public inState(State.Succeeded) {
        if (beneficiary.send(totalCollected)) {
            state = State.PaidOut;
        } else {
            state = State.Failed;
        }
    }

    function withdraw() public inState(State.Failed) {
        require(amounts[msg.sender] > 0, "Nothing was contributed"); // Only want addresses that have contributed to withdraw, stored this in amounts mapping. 
        uint contributed = amounts[msg.sender];
        amounts[msg.sender] = 0;

        if (!msg.sender.send(contributed)) {
            amounts[msg.sender] = contributed;
            // If the sending of funds to beneficiary fails, then we revert the amount the msg.sender has. 
        }
    }


    // Public means any other contract or outside address can call on this method 

    function beforeDeadline() public view returns(bool) {
        return currentTime() < fundingDeadline;
    }
}
var CrowdFundingWithDeadline = artifacts.require('./CrowdFundingWithDeadline.sol');

module.exports = function(deployer) {
    deployer.deploy( // BELOW IS BASED ON CONSTRUCTOR IN .SOL FILE:
        CrowdFundingWithDeadline,
        "Test campaign is the name of the contract", // name of contract we're deploying
        1, // amount of ether target for crowdfunding campaign
        200, // time, in seconds
        "0x78ED49543f91aF710b16D2Ec963C4d6C01e5D9Bd" // beneficiary address
    )
}
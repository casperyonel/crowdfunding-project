let Utils = artifacts.require("./Utils.sol");
let CrowdFundingWithDeadline = artifacts.require("./CrowdFundingWithDeadline.sol")
let TestCrowdFundingWithDeadline = artifacts.require("./TestCrowdFundingWithDeadline.sol")

module.exports = async function(deployer) {
    await deployer.deploy(Utils); // Deploying library Utils.sol
    deployer.link(Utils, CrowdFundingWithDeadline);
    deployer.link(Utils, TestCrowdFundingWithDeadline);
    // Need to link for BOTH testing and deploying to Ethereum. TestCrowd... is a child of Crowd...
};
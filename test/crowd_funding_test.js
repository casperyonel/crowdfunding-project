let CrowdFundingWithDeadline = artifacts.require('./CrowdFundingWithDeadline.sol')

contract('CrowdFundingWithDeadline', function(accounts) {
    
    let contract; 
    let contractCreator = accounts[0];
    let beneficiary = accounts[1];

    const ONE_ETH = 1000000000000000000;


    // Below is for simplification purposes for testing so the valueOf() method is easier to read: (remember, we use valueOf() to test state!)
    const ONGOING_STATE = "0"
    const FAILED_STATE = "1" 
    const SUCCEEDED_STATE = "2" 
    const PAID_OUT_STATE = "3" 


    // Below is initializing the contract we're testing:
    beforeEach(async function() {
        // below lines are creating a contract to test, 
        contract = await CrowdFundingWithDeadline.new(
            'funding', // name of campaign / contract
            1, // amount of ether needed to fund campaigns
            10, // time duration in minutes
            beneficiary,
            {
                from: contractCreator, // address to deploy contract, which we're using function(accounts) because it's generated with truffle. 
                gas: 2000000 // gas to spend for deployment transaction
            }
            /* 
            from .sol file, reference the below for contract structure: 
                string contractName,
                uint targetAmountETH,
                uint durationInMin, 
                address beneficiaryAddress    
            */ 
        )
    });

    it('contract is initialized', async function() {
        let campaignName = await contract.name.call()
        expect(campaignName).to.equal('funding');
    
        let targetAmount = await contract.targetAmount.call()
        expect(targetAmount.toNumber()).to.equal(ONE_ETH)
        // Above is converting the result into a JS number which is what the smart contract will return to us
        // Our contract was initialized to take in Eth, not wei, so our ONE_ETH is normalized that. 

        let actualBeneficiary = await contract.beneficiary.call()
        expect(actualBeneficiary).to.equal(beneficiary)

        let state = await contract.state.call()
        expect(state.valueOf()).to.equal(ONGOING_STATE)
        // valueOf is a method we use to check state, will return a string of single char of an array index type structure
        // so if this contract returns the "Ongoing" state as defined in the smart contract .sol, it will return "0"
        // if it returned the Succeeded state, it will return the string "3"
    });

});
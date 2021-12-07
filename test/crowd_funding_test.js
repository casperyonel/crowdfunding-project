let CrowdFundingWithDeadline = artifacts.require('./TestCrowdFundingWithDeadline.sol')

contract('CrowdFundingWithDeadline', function(accounts) {
    
    let contract; 
    let contractCreator = accounts[0];
    let beneficiary = accounts[1];

    const ONE_ETH = 1000000000000000000;
    const ERROR_MSG = 'VM Exception while processing transaction: revert';


    // Below is for simplification purposes for testing so the valueOf() method is easier to read: (remember, we use valueOf() to test state!)
    const ONGOING_STATE = "0";
    const FAILED_STATE = "1";
    const SUCCEEDED_STATE = "2";
    const PAID_OUT_STATE = "3"; 


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

        let fundingDeadline = await contract.fundingDeadline.call()
        expect(fundingDeadline.toNumber()).to.equal(600)
        // fundingDeadline = currentTime() + durationInMin * 1 minutes;
        // fundingDeadline = 0 is default + 10 minutes (defined above) * 60 seconds

        let actualBeneficiary = await contract.beneficiary.call()
        expect(actualBeneficiary).to.equal(beneficiary)

        let state = await contract.state.call()
        expect(state.valueOf()).to.equal(ONGOING_STATE)
        // valueOf is a method we use to check state, will return a string of single char of an array index type structure
        // so if this contract returns the "Ongoing" state as defined in the smart contract .sol, it will return "0"
        // if it returned the Succeeded state, it will return the string "3"
    });


    it('funds were successfully contributed', async function() {
        await contract.contribute({
            value: ONE_ETH,
            from: contractCreator
        });

        let contributed = await contract.amounts.call(contractCreator);
        // Passing in the contractCeator address into the amounts mapping as a key to see how much it has contributed.
        // The method of amounts mapping will return a value when we input an address. 
        expect(contributed.toNumber()).to.equal(ONE_ETH);

        let totalCollected = await contract.totalCollected.call();
        expect(totalCollected.toNumber()).to.equal(ONE_ETH);
    });

    it('cannot contribute before the deadline', async function() {
        try {
            await contract.setCurrentTime(601);
            await contract.contribute({
                value: ONE_ETH, 
                from: contractCreator
            });
            expect.fail();
            // This makes sure an exception is thrown during the test execution. 
        }
        catch (error) {
            expect(error.message).to.equal(ERROR_MSG);
        }
    });

    it('crowdfunding succeeded', async function() {
        await contract.contribute({
            value: ONE_ETH,
            from: contractCreator
        });
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();
        let state = await contract.state.call();

        expect(state.valueOf()).to.equal(SUCCEEDED_STATE);
    });

    it('crowdfunding failed', async function() {
        // Contribute nothing in this test and set time past deadline, and then check to make sure state has failed. 
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();
        let state = await contract.state.call();

        expect(state.valueOf()).to.equal(FAILED_STATE);
    });

    it('collected money paid out', async function() {
        await contract.contribute({
            value: ONE_ETH,
            from: contractCreator
        });
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();

        let initAmount = await web3.eth.getBalance(beneficiary);
        await contract.collect({
            from: contractCreator
        });

        let newBalance = await web3.eth.getBalance(beneficiary);
        expect(newBalance - initAmount).to.equal(ONE_ETH); // Because we contributed one eth above in another test. 

        let fundingState = await contract.state.call();
        expect(fundingState.valueOf()).to.equal(PAID_OUT_STATE);
    });

    it('withdraw funds from the contract', async function() {
        await contract.contribute({
            value: ONE_ETH - 100,
            from: contractCreator
        });
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();

        await contract.withdraw({
            from: contractCreator
        });

        let amount = await contract.amounts.call(contractCreator)
        expect(amount.toNumber()).to.equal(0)
    });

    it('event is emitted', async function() {
        let watcher = contract.CampaignFinished(); // Start listening for event
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding(); // Finish the crowdfunding while we're listening.

        let events = await watcher.get(); // Get method
        let event = events[0];
        expect(event.args.totalCollected.toNumber()).to.equal(0); // TotalCollected amount is 0 since we contributed no funds. 
        expect(event.args.succeeded).to.equal(false); // This campaign has failed. 
    });
});
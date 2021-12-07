// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

library Utils {
    function etherToWei(uint sumInEth) public pure returns(uint) {
        return sumInEth * 1 ether; // converts to Wei from Eth, ether represents wei actually. 
    }

    function minutesToSeconds(uint timeInMin) public pure returns(uint) {
        return timeInMin * 1 minutes; // converts to seconds. 
    }
}
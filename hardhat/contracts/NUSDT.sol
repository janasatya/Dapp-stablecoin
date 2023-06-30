//SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract nUSDT is ERC20,ReentrancyGuard  {
    AggregatorV3Interface internal dataFeed;
    constructor() ERC20("New USDT", "nUSDT") {
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306 //chainlink price feed contract address
        );
    }

    function deposit() payable nonReentrant external {
        // require(msg.sender!=address(0),"address can not be null") --> is not needed because it's availabe in _mint function
        uint msgValue=msg.value;
        require(msgValue>0,"msg.value can not be zero");
        address msgSender= msg.sender;
        int price=getLatestData();
        require(price>0,"price can not be negative or zero");
        uint amount=(msgValue*uint(price))/1e8;// derived from --> ( msgValue* (uint(price)*1e10) ) / (1e18)
        _mint(msgSender, amount); 
    }
    function redeem(uint _amount) nonReentrant  external{
        // require(msg.sender!=address(0),"address can not be null") --> is not needed because it's availabe in _burn function
        // require(balanceOf(msg.sender)>=_amount) --> is not needed because it's availabe in _burn funtion
        require(_amount>0,"amount should be positive");
        address msgSender= msg.sender;
        int price=getLatestData()*1e10; // multiplication to get upto 18 decimals
        require(price>0,"price can not be negative or zero");
        uint transferMoney=((_amount)*1e18)/uint(price); // unit of wei
        require(address(this).balance>=transferMoney,"Not enough ethers availabe");
        _burn(msgSender,_amount); 
        payable(msgSender).transfer(transferMoney);
    }
    function getLatestData() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer/2; // 1 nUSDT = 2 USD
    }
}

const { assert } = require("chai");
const Abi=require('../artifacts/contracts/NUSDT.sol/nUSDT.json')
const {ALCHEMY_KEY,Contract_Address}=require('../config.js')
const ethers=require('ethers')
require('dotenv').config()

describe("nUSDT Contract",()=>{
    let contract=null;
    let account=null;
    let signer=null;
    before(async()=>{
        const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_KEY);
        signer = new ethers.Wallet(process.env.Private_Key, provider)
        account=await signer.getAddress();
        contract= new ethers.Contract(Contract_Address,Abi.abi,signer);
    })

    //Read operation from Contract

    it("price of per eth in the form of nUSDT", async()=>{
    let data=await contract.getLatestData();
    let price=data.toNumber();
    console.log("Price: ",price)
    assert(price!=null && price>0,"price is not valid")
    })

    it("Total Supply of token",async()=>{
        let data=await contract.totalSupply();
        let totalSupply=data.toBigInt();
        console.log("Total Supply: ",totalSupply)
        assert(totalSupply!=null,"invalid totalSupply");
    })

    it("balance of the account",async()=>{
        let data=await contract.balanceOf(account);
        let balance=data.toBigInt();
        console.log("Balance: ",balance);
        assert(balance!=null,"invalid balance")
    })

    //Write operation from contract

    //Buy Token
    it("Buy nUSDT Token",async()=>{
        let beforeBalance=await contract.balanceOf(account);
        beforeBalance=beforeBalance.toBigInt();

        //buy token
        const amount = ethers.utils.parseUnits('1.2', "ether"); //let buy nUSDT exchange of 1.2 eth
        let transaction=await contract.deposit({value:amount});
        await transaction.wait();
        
        let afterBalance=await contract.balanceOf(account);
        afterBalance=afterBalance.toBigInt();

        let ethPrice=await contract.getLatestData();
        ethPrice=ethPrice.toBigInt()*10000000000n; //for 18 decimals number

        //for 1.2 eth we get 1.2*ethPrice
        let getAmount=ethPrice*12n/10n;

        console.log("Before Balance: ",beforeBalance)
        console.log("After Balance: ",afterBalance);
        console.log("Get Amount: ",getAmount)
        console.log("AfterBalance-BeforeBalance: ",afterBalance-beforeBalance)

        assert(afterBalance-beforeBalance==getAmount,"operation failed")
    })

    //Redeem Token
    it("Redeem nUSDT Token",async()=>{
        let amount=950000000000000000000n; //let redeem 950 nUSDT
        let transaction=await contract.redeem(amount);
        await transaction.wait();
    })
})
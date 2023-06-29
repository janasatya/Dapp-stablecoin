import Web3modal from "web3modal";
import Abi from "../abi/nUSDT.json";
import { ALCHEMY_KEY, Contract_Address } from "../config.js";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function Home() {
  const [account, setAccount] = useState(null);
  const [usdBalance, setUsdBalance] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [usdPrice, setUsdPrice] = useState(null);
  const [nusdPrice, setNusdPrice] = useState(null);
  const [totalSup, setTotalSup] = useState(null);
  const [webApi, setWebApi] = useState({ contract: null, signer: null });
  const [bToken, setBToken] = useState(null);
  const [rToken, setRToken] = useState(null);
  const [ethAmount,setEthAmount]=useState(0);
  const [nusdtAmount,setNusdtAmount]=useState(0);
  const [reload, setReload] = useState(true);

  async function connectWallet() {
    try {
      const web3modal = new Web3modal();
      const connection = await web3modal.connect();
      const provider = await new ethers.providers.Web3Provider(connection);
      const signer = await provider.getSigner();
      // console.log(await signer.getAddress())
      setAccount(await signer.getAddress());
      const network = await provider.getNetwork();
      if (network.chainId != 11155111) {
        alert("please connect sepolia network");
        return;
      }
      const contract = await new ethers.Contract(
        Contract_Address,
        Abi.abi,
        signer
      );
      setWebApi({ contract: contract, signer: signer });
    } catch (e) {
      alert("Please reload the page");
      return;
    }
  }

  useEffect(() => {
    async function fetchData() {
      const { contract, signer } = webApi;
      if (signer != null) {
        let ethBal = await signer.getBalance();
        ethBal = ethBal.div(10000000000000000n).toNumber();

        let usdBal = await contract.balanceOf(account);
        usdBal = usdBal.div(10000000000n).toNumber();

        let usd = await contract.getLatestData();

        let totalSupply = await contract.totalSupply();
        totalSupply = totalSupply.div(10000000000n).toNumber();
        setUsdPrice((usd.toNumber() * 2) / 100000000);
        setNusdPrice(usd.toNumber() / 100000000);
        setUsdBalance(usdBal / 100000000);
        setEthBalance(ethBal / 100);
        setTotalSup(totalSupply / 100000000);
      }
    }
    fetchData();
  }, [webApi.contract, reload]);

  async function buyToken() {
    const { contract, signer } = webApi;
    try {
      const money = ethers.utils.parseUnits(bToken.toString(), "ether");
      const transaction = await contract.deposit({ value: money });
      await transaction.wait();
      alert("Successfull");
      setReload(!reload);
      return;
    } catch (e) {
      console.log(e);
    }
  }
  async function reedemToken() {
    const { contract, signer } = webApi;
    try {
      let amount = rToken * 100000000;
      amount = BigInt(amount) * 10000000000n;
      const transaction = await contract.redeem(amount);
      await transaction.wait();
      alert("Successfull");
      setReload(!reload);
      return;
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="w-2/3 m-auto mt-4 font-bold">
      <button
        className="border-2 border-black p-2 block m-2"
        onClick={connectWallet}
      >
        Connect Wallet
      </button>
      <h1 className="m-2">Account Address: {account}</h1>
      <h1 className="m-2">Your Balance: {ethBalance} Eth</h1>
      <h1 className="m-2">Your Balance: {usdBalance} nUSDT</h1>
      <h1 className="m-2">Current Price(USD/eth): {usdPrice}</h1>
      <h1 className="m-2">Current Price(nUSDT/eth): {nusdPrice}</h1>
      <h1 className="m-2">Total Supply: {totalSup} nUSDT</h1>
      <div className="m-2">
      <label htmlFor="deposit" >Amount(eth): </label>
        <input
          type="number"
          name="deposit"
          id="deposit"
          className="border border-black p-1"
          onChange={(e) => {
            setBToken(e.target.value);
            let data=Number(e.target.value)
            if(nusdPrice!=null){
              setNusdtAmount(nusdPrice*data);
            }
          }}
        />
        <input
          type="number"
          name="deposit"
          id="deposit"
          className="border border-black p-1"
          value={nusdtAmount}
          readOnly
        />
        <button className="border-2 border-black p-1" onClick={buyToken}>
          Buy Token
        </button>
      </div>
      <div className="m-2">
        <label htmlFor="redeem" >Amount(nUSDT): </label>
        <input
          type="number"
          name="redeem"
          id="redeem"
          className="border border-black p-1"
          onChange={(e) => {
            setRToken(Number(e.target.value));
            let data=Number(e.target.value);
            if(nusdPrice!=null){
              setEthAmount(data/nusdPrice);
            }
          }}
        />

        <input
          type="number"
          name="deposit"
          id="deposit"
          className="border border-black p-1"
          value={ethAmount}
          readOnly
        />
        <button className="border-2 border-black p-1" onClick={reedemToken}>
          Reedem Token
        </button>
      </div>
    </div>
  );
}

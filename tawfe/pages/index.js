import React, { useEffect, useState } from 'react';
import styles from "../styles/Home.module.css";
// import { NFT_CONTRACT_ADDRESS} from "../constants";
import { ethers, utils} from "ethers";
import TAW from '../utils/TAW.json';


const CONTRACT_ADDRESS = "0x94Ae1F3Aa16A0797912Eb0615bCBa49360Ee2f9D";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [nftCount, setNftCount] = useState(null);
  const [myMintedNFT, setMintedNFT] = useState(null);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
    } else {
        console.log("We have the ethereum object", ethereum);
    }

    /*
    * Check if we're authorized to access the user's wallet
    */
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    /*
    * User can have multiple authorized accounts, we grab the first one if its there!
    */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      let chainId = await ethereum.request({ method: 'eth_chainId' });
console.log("Connected to chain " + chainId);

// String, hex code of the chainId of the Rinkebey test network
const rinkebyChainId = "0x4"; 
if (chainId !== rinkebyChainId) {
	alert("You are not connected to the Rinkeby Test Network!");
}

      setupEventListener()
    } else {
      console.log("No authorized account found");
    }
  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 

      setupEventListener()
    } catch (error) {
      console.log(error);
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, TAW.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        let showNFT = await connectedContract.viewNFT();
        setMintedNFT(showNFT);
        alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${Number(myMintedNFT)}`)

        console.log("Setup event listener!")
       

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  

  

  const mintNft = async () => {
   

    try {
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, TAW.abi, signer);
  
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.mint({
          value: utils.parseEther("0.01"),
        });
  
        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
  
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getTokenIdsMinted = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, TAW.abi,signer);
        let totalMinted = await connectedContract.getTokenIdsMinted();
        setNftCount(totalMinted)
        console.log(`Total NFTs Minted: ${totalMinted}`);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

   // Render Methods
   const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className={styles.button}
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button
      onClick={mintNft}
      className={styles.button}
    >
      Mint NFT
    </button>
  );

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
    getTokenIdsMinted();
  }, [])

  return (
    <div>
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>I am woman phenomenally</h1>
        <div className={styles.description}>
          The Awakened Woman is 5,555 NFT collection celebrating the divine feminine.
        </div>
        {currentAccount === ''
            ? renderNotConnectedContainer()
            : renderMintUI()}
            <div className={styles.description}>
              {Number(nftCount)}/30 have been minted
            </div>

<div className={styles.description}>
    <a href = {`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${myMintedNFT}`}><span className={styles.description}>View your NFT on Opensea</span></a>
    </div>
      </div>
      
    </div>

    <footer className={styles.footer}>Made by Adaihueze</footer>
  </div>
  );

};
export default App;
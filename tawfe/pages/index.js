import React, { useEffect, useState } from 'react';
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { NFT_CONTRACT_ADDRESS, abi } from "../constants";
import { ethers, utils } from "ethers";
import axios from 'axios';


const App = () => {
  // State
  const [currentAccount, setCurrentAccount] = useState(null);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  const [mintedNFT, setMintedNFT] = useState(null)
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
         /*
         * We set isLoading here because we use return in the next line
         */
         setLoading(false);
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }
     /*
     * We release the state property after all the function logic
     */
     setLoading(false);
  };


    // const checkNetwork = async () => {
    //   try { 
    //     if (window.ethereum.networkVersion !== '4') {
    //       alert("Please connect to Rinkeby!")
    //     }
    //   } catch(error) {
    //     console.log(error)
    //   }
    // }

   




  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };




  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkNetwork = async() => {

    try {
      if (window.ethereum.networkVersion !== '4') {
        alert("Please connect to Rinkeby!")
      }
    } catch(error) {
      console.log(error)
    }

  }

  /*
 * Add this useEffect right under the other useEffect where you are calling checkIfWalletIsConnected
 */

  useEffect(() => {

    checkNetwork();
    connectWalletAction();
    getTokenIdsMinted();

    // set an interval to get the number of token Ids minted every 5 seconds
    setInterval(async function () {
      await getTokenIdsMinted();
    }, 60 * 1000);
  })

const mintNFT = async () => {
  try {
    console.log('Checking for Character NFT on address:', currentAccount);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, signer);
  
    const txn = await nftContract.mint({
      value: utils.parseEther("0.01"),
    });

    setLoading(true);

    await txn.wait();
    setLoading(false);
    window.alert("You successfully minted a TAW!");

    getMintedNFT(tokenId);

  } catch (error) {
    console.warn('Minting Error:', error);
  }
}

const getTokenIdsMinted = async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask
    // No need for the Signer here, as we are only reading state from the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, provider);
    // call the tokenIds from the contract
    const _tokenIds = await nftContract.tokenIds();
    console.log("tokenIds", _tokenIds);
    //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
    setTokenIdsMinted(_tokenIds.toString());
  } catch (err) {
    console.error(err);
  }
};

// Gets the minted NFT data
const getMintedNFT = async (tokenId) => {
  try {
    const { ethereum } = window

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );

      let tokenUri = await nftContract.tokenURI(tokenId)
      let data = await axios.get(tokenUri)
      let meta = data.data

      setLoading(false);
      setMintedNFT(meta.image);
    } else {
      console.log("Ethereum object doesn't exist!")
    }
  } catch (error) {
    console.log(error)
    setTxError(error.message)
  }
}


const renderButton = () => {
  // If wallet is not connected, return a button which allows them to connect their wallet
  if (!currentAccount) {
    return (
      <button onClick={connectWalletAction} className={styles.button}>
        Connect your wallet
      </button>
    );
  }

  // If we are currently waiting for something, return a loading button
  if (loading) {
    return <button className={styles.button} >Loading...</button>;
  }

  return (
    <button className={styles.button} onClick={mintNFT}>
      Public Mint 🚀
    </button>
  );
};

  return (
    <div>
    <Head>
      <title>LW3Punks</title>
      <meta name="description" content="LW3Punks-Dapp" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>I am woman phenomenally</h1>
        <div className={styles.description}>
          The Awakened Woman is 5,555 NFT collection celebrating the divine feminine.
        </div>
        <div className={styles.description}>
                {tokenIdsMinted}/30 have been minted
              </div>
        {renderButton()}
        <div>
          <div className={styles.description}>
        <a href={`https://rinkeby.rarible.com/collection/${NFT_CONTRACT_ADDRESS}`} target = '_blank'>
          <span className={styles.description}>View collection on Rarible</span>
        </a>
        </div>
          <img className={styles.image} src={mintedNFT} />
        </div>
      </div>
    </div>

    <footer className={styles.footer}>Made with &#10084; by LW3Punks</footer>
  </div>
  );
};

export default App;
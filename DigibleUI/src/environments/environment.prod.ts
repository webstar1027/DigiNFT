export const environment = {
  production: true,
  defaultNetwork: 'MATIC',
  // infuraId: '5164caa2bf9746fb98c4c16b73824cb1',
  infuraId: '34d8dfc0582a4ed2942bde94f39a0a1e',
  moralisId: '22522ebac5cf1323c7cd51dc',
  offchainApi: 'https://api.digible.io',
  systemLabsAPi: 'https://digible-api.staging.doodle.je/api',
  testnet: false,
  stableCoinAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT POLYGON
  stableCoinAddressEth: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT ETHEREUM
  stableCoinDecimals: 18,
  stableCoinSymbol: 'USDT',
  tokenIdForAuction0: 53,
  maticBridgeAddress: '0xA0c68C638235ee32657e8f720a23ceC1bFc77C77',
  maticPredicate: '0xE6F45376f64e1F568BD1404C155e5fFD2F80F7AD',
 // marketplaceAddressMatic: '0x8486dFb5078c5e5b79576A83aB59Bdc5C52094C0',
 // marketplaceAddressEth: '',

 // ############# NFTS
 // PUBLIC MINT

  nftAddress: '0xE71b772C99F79b2cc9B5a0e204e88Ba14fBB61C4', // ETHEREUM
  nftAddressBSC: '0xd57e96223BF054c21dd159c5ab467Ee595D88064',
  nftAddressMatic: '0x1eA016dcD53bA2EBe9DbD1C0418FF816b6FF9B25',

  nftBulkMintAddress: '0x7f3b5Ed13Ab81B119D819FFd60E609C74B002EC9', // need new address 
  nftBulkMintAddressMatic: '0x7f3b5Ed13Ab81B119D819FFd60E609C74B002EC9',
  nftBulkMintAddressBSC: '0x6685b570cEAA9245B49446dDE7b4032222103525',
  
  


  // CubeNFTs

  nftCubesAddressMatic: '0x4d4475e5591c00525069c52f3489be59b321ba64',
  nftCubesAddressBSC: '0x2AafE249aC0f8AA409D38B8504B7fa620dCC2BA1', 

  // KEYs NFTs
  nftKeysAddressMatic: '0x13827F0d808a9cb0170e8759D9453D2B4C0d402e',
  
  // SpecialNFT Contracts
  nftDigiLOIBSC: '0x78E9511Cb599C56FeB5C115BcdADEc41c1113e1F',
  ukraineMintBsc: "", // NEED TO ADD LIVE MAINNET WHEN LAUNCHED





  

   // #########################################

  //auctionAddressMatic: '0xE6a415ad24f7028a572dA3F083458b6DD7Dcb717', //0xbeD8ca06f94Ae1F82Ff09fcDd1e4CA2fBA6B9f4D',
  //auctionAddressEth: '',
  duelsAddress: '0x08dBC03c64B028135CB2758Ca5089aba08fae96D',
  utilsAddress: '0x11d1816da0c7111aa39145e3509ba1349fffa6b4',
  utilsAddressMatic: '0xB4b40640fEb2374540b97eb90FdF0AE6dd42c6F5',
  stakeAddress: '0x82E08e68AbFCa69583E12365E64C61e5Ae45CBFA',
 
  digiWaxAddressMatic: '0xF72157942e004fA0AF56A7AA0AbE4e49d22a9ea6',
  digiWaxAddressEth: '',

  // DigCubesNFT



  //v2 staking MAINNNET 
  stakev2AddressMatic1: '0xCBf90E203F97CaeEF9B6cfe7B732bcC885f4E097',
  stakev2AddressMatic2: '0x2F8026d1a35d4ADF2fb4b9Ad8186293611738AD2',
  stakev2AddressMatic3: '0x2EAB01eEFb42dcA7c05f61b79e8378Ad147a71D5',

 
  digiTradeAddressMatic: '0x915338948fBF10583DD15C6FcCCF55565FF5b60f',
  digiTradeAddressBSC: '0x1BCAB2066D105f4670aedf1093Ca9C2e65f510E2',

  digiTrackAddressMatic: '0x4168a4D108b24A347F19617BB95C25c8Eb9618de',
  digiTrackAddressEth: '',
  digiTrackAddressBSC: '0x11E4631452B6cF3de0bDAb746b8C46911899A28a', 

  digiAuctionAndMarketPlaceMatic: '0x2179F8F3763a88A3801EA85C3C84A8a9aA17ea81',
  digiAuctionAndMarketPlaceEth: '',
  digiAuctionAndMarketPlaceBSC: '0xC0ED4B06A1d0b9d1e245445dF689Cb1368b385E6',
  digiAuctionAndMarketPlaceAvax: '',


  deletedNfts: [],
  blocksInEvents: 99999,
  moralis: {
    appId: 'hzfkAJGwTYXdzxSFoG2Z2GAPbwmxWI293iaWutZd',
    serverUrl: 'https://eubmjuyfocxg.usemoralis.com:2053/server'
  },
  
  // COIN ADDRESSES FOR MARKETPLACE AND OTHER PAYMENT RELATED FUNCTIONS.
  // USE THROUGH wallet.service.ts 

  maticCoinContractAddresses: {
    maticCoinAddress: '0x0000000000000000000000000000000000001010',
    digiAddressMatic: '0x4d8181f051E617642e233Be09Cea71Cc3308ffD4',
    usdcAddressMatic: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    linkAddressMatic: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
    usdtAddressMatic: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    wethAddressMatic: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    wbtcAddressMatic: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
  },

  bscCoinContractAddresses: {
   
    digiBSCAddress: '0x82cD5A3342ccc1329E7022857d8DB73A52dfEbAb',
    busdBSCAddress: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    wbnbBSCAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    usdcBSCAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    soulsBSCAddress: '0x6545cAC09cC84fa234C2e421D2EedEECaC8Eb2D9',
  },

  ethCoinContractAddresses: {
    ethCoinAddress: '',
    digiEthAddress: '0x3cbf23c081faa5419810ce0f6bc1ecb73006d848',
    usdcEthAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    usdtEthAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    maticEthAddress: '',
  },
  

  // maticCurrencyNames: {
 //=====> See CoinList Service. Includes Decimal resolution !!!!
  //   "0x4d8181f051E617642e233Be09Cea71Cc3308ffD4": 'DIGI',
  //   "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": 'USDC',
  //   "0xb0897686c545045aFc77CF20eC7A532E3120E0F1": 'LINK',
  //   "0xc2132D05D31c914a87C6611C10748AEb04B58e8F": 'USDT',
  //   "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619": 'WETH'
  // },
  // ethCurrencyNames: {
  //   "0x3cbf23c081faa5419810ce0f6bc1ecb73006d848": 'DIGI',
  //   "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 'USDC',
  //   "0xdAC17F958D2ee523a2206206994597C13D831ec7": 'USDT'
  // },
  // bscCurrencyNames: {
  //   "0x82cD5A3342ccc1329E7022857d8DB73A52dfEbAb": 'DIGIBSC',
  //   "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56" : 'BUSD' 
  // },
  ipfsBaseUri: 'https://ipfs.moralis.io:2053/', // baseUri of moralis ipfs
};

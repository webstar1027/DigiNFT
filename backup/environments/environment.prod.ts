export const environment = {
  production: true,
  defaultNetwork: 'MATIC',
  // infuraId: '5164caa2bf9746fb98c4c16b73824cb1',
  infuraId: '34d8dfc0582a4ed2942bde94f39a0a1e',
  moralisId: '22522ebac5cf1323c7cd51dc',
  offchainApi: 'https://dev-api.digible.io',
  systemLabsAPi: 'https://digible-api.staging.doodle.je/api',
  testnet: false,
  stableCoinAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT POLYGON
  stableCoinAddressEth: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT ETHEREUM
  stableCoinDecimals: 18,
  stableCoinSymbol: 'USDT',
  tokenIdForAuction0: 53,
  maticBridgeAddress: '0xA0c68C638235ee32657e8f720a23ceC1bFc77C77',
  maticPredicate: '0xE6F45376f64e1F568BD1404C155e5fFD2F80F7AD',
  marketplaceAddressMatic: '0x8486dFb5078c5e5b79576A83aB59Bdc5C52094C0',
  marketplaceAddressEth: '',
  nftAddress: '0xE71b772C99F79b2cc9B5a0e204e88Ba14fBB61C4',

  nftKeysAddressMatic: '0x13827F0d808a9cb0170e8759D9453D2B4C0d402e',
  nftAddressMatic: '0x1eA016dcD53bA2EBe9DbD1C0418FF816b6FF9B25',
  digiAddressEth: '0x3cbf23c081faa5419810ce0f6bc1ecb73006d848',
  digiAddressMatic: '0x4d8181f051E617642e233Be09Cea71Cc3308ffD4',
  //auctionAddressMatic: '0xE6a415ad24f7028a572dA3F083458b6DD7Dcb717', //0xbeD8ca06f94Ae1F82Ff09fcDd1e4CA2fBA6B9f4D',
  //auctionAddressEth: '',
  duelsAddress: '0x08dBC03c64B028135CB2758Ca5089aba08fae96D',
  utilsAddress: '0x11d1816da0c7111aa39145e3509ba1349fffa6b4',
  utilsAddressMatic: '0xB4b40640fEb2374540b97eb90FdF0AE6dd42c6F5',
  stakeAddress: '0x82E08e68AbFCa69583E12365E64C61e5Ae45CBFA',
  // digiWaxAddressMatic: '0x4440D08AA5951A9237b24BB673FB1b3375730Ae1', //old
  digiWaxAddressMatic: '0xF72157942e004fA0AF56A7AA0AbE4e49d22a9ea6',
  digiWaxAddressEth: '',

  // DigCubesNFT

  nftCubesAddressMatic: '0x4d4475e5591c00525069c52f3489be59b321ba64',

  // SpecialNFT Contracts
  DigiLOIBSC: '0x78E9511Cb599C56FeB5C115BcdADEc41c1113e1F',

  //v2 staking MAINNNET 
  stakev2AddressMatic1: '0xCBf90E203F97CaeEF9B6cfe7B732bcC885f4E097',
  stakev2AddressMatic2: '0x2F8026d1a35d4ADF2fb4b9Ad8186293611738AD2',
  stakev2AddressMatic3: '0x2EAB01eEFb42dcA7c05f61b79e8378Ad147a71D5',

  // digitrade still TESTNET
  digiTradeAddressMatic: '0x90f7a68748AB8481A4d150E7B84d120e707A9774',
  digiTradeAddressEth: '',

  digiTrackAddressMatic: '0x4168a4D108b24A347F19617BB95C25c8Eb9618de',
  digiTrackAddressEth: '',

  digiAuctionAndMarketPlaceMatic: '0x2179F8F3763a88A3801EA85C3C84A8a9aA17ea81',
  digiAuctionAndMarketPlaceEth: '',
  digiAuctionAndMarketPlaceBSC: '',
  digiAuctionAndMarketPlaceAvax: '',


  deletedNfts: [],
  blocksInEvents: 99999,
  moralis: {
    appId: 'hzfkAJGwTYXdzxSFoG2Z2GAPbwmxWI293iaWutZd',
    serverUrl: 'https://eubmjuyfocxg.usemoralis.com:2053/server'
  },
  
  maticCoinContractAddresses: {
    maticCoinAddress: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    digiAddressMatic: '0x4d8181f051E617642e233Be09Cea71Cc3308ffD4',
    usdcAddressMatic: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    linkAddressMatic: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
    usdtAddressMatic: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    ethAddressMatic: '',
  },
  ethCoinContractAddresses: {
    ethCoinAddress: '',
    digiEthAddress: '0x3cbf23c081faa5419810ce0f6bc1ecb73006d848',
    usdcEthAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    usdtEthAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    maticEthAddress: '',
  },
  
  maticCurrencyNames: {
    0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0: 'MATIC',
    0x4d8181f051E617642e233Be09Cea71Cc3308ffD4: 'DIGI',
    0x2791bca1f2de4661ed88a30c99a7a9449aa84174: 'USDC',
    0xb0897686c545045aFc77CF20eC7A532E3120E0F1: 'LINK',
    0xc2132D05D31c914a87C6611C10748AEb04B58e8F: 'USDT',
  },
  ethCurrencyNames: {
    0x3cbf23c081faa5419810ce0f6bc1ecb73006d848: 'DIGI',
    0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48: 'USDC',
    0xdAC17F958D2ee523a2206206994597C13D831ec7: 'USDT'
  },
};

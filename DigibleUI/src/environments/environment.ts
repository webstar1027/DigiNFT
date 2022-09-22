// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import Matic from "@maticnetwork/maticjs";

export const environment = {
  production: false,
  defaultNetwork: 'MATIC',
  // infuraId: '34d8dfc0582a4ed2942bde94f39a0a1e', // 'ce8333acba8a412dab873112eb81c8f1', // 11185ce0751941c68277973c6c4151bb
  infuraId: 'ce8333acba8a412dab873112eb81c8f1', // 'ce8333acba8a412dab873112eb81c8f1', // 11185ce0751941c68277973c6c4151bb
  moralisId: '22522ebac5cf1323c7cd51dc',
  offchainApi:   'https://dev-api.digible.io',
  // offchainApi:   'http://127.0.0.1:3000',
  systemLabsAPi: 'https://digible-api.staging.doodle.je/api',
  testnet: true,
  stableCoinAddress: '0xDcF513F3E5358467B1a4ec1a78411169a1Fdc5f3', //USDC MUMBAI
  stableCoinAddressEth: '0xdCFaB8057d08634279f8201b55d311c2a67897D2', // USDC ETH
  //stableCoinAddressEth: '0xe4ffd592b36e92e1a53c01f441728a1e5d953c24',
  stableCoinDecimals: 18,
  stableCoinSymbol: 'USDC',
  tokenIdForAuction0: 4,
  maticBridgeAddress: '0xbbd7cbfa79faee899eaf900f13c9065bf03b1a74',
  maticPredicate: '0x74D83801586E9D3C4dc45FfCD30B54eA9C88cf9b',
  // marketplaceAddressMatic: '0xDf7e8A8272253f57477f73d4bAaf0532323EeB31',//0x878CF322ADBBB076e5b4c1FBbCcB9337dB059F98
  // marketplaceAddressEth: '0xA80C4E7f0B459F884bc7C670D7a2b6305bD1872A',
 
  
// ############# NFTS
// PUBLIC MINT
  nftAddress: '0x4e4e06dfB3aCD27e6a96fEc7458726EEc5b487d0', // ETHEREUM PUBLIC MINT
  nftAddressMatic: '0x2050ebd262db421de662607a05be26930edbb8c8',
  nftAddressBSC: '0xC10A6Eb3c619B16F17d3d3624d26B5bc84E0aca6',
  nftAddressFantom: '0x3CbF23c081fAA5419810ce0F6BC1ECb73006d848',

  //MultiMint
  nftBulkMintAddress: '0x8dB592277F06e6F0366EF99A575e22A47b76E703',  
  nftBulkMintAddressMatic: '0x8dB592277F06e6F0366EF99A575e22A47b76E703',
  nftBulkMintAddressBSC: '0x4d8181f051E617642e233Be09Cea71Cc3308ffD4',
  

// CubeNFTs
  nftCubesAddressMatic: '0xa4ACe9a3D90fbAe14a4b42698F480f4282a49A2d',
  nftCubesAddressBSC: '0x2AafE249aC0f8AA409D38B8504B7fa620dCC2BA1',

// KEYs NFTs
  nftKeysAddressMatic: '0xEe264772823271863b02761c023F8bAE1A5ee0F8',

// SpecialNFT Contracts
  nftDigiLOIBSC: '0xe1d33ef2570C1a3C34A279b7df423C68fdbee9B2',
  
  
  ukraineMintBsc: "0x9947Ce3fB4197BD11f1cCAc84991F24EC2ED9df1",




  
 // auctionAddressMatic: '0xCBf90E203F97CaeEF9B6cfe7B732bcC885f4E097',  //0xea3D4124dd3559530F88E83777E4a0c31de318FE
  // auctionAddressEth: '',
  duelsAddress: '0x08dBC03c64B028135CB2758Ca5089aba08fae96D',
  utilsAddress: '0x6abf03c909c56a19b8c8129f6b4eb1a36dfcbc21',
  utilsAddressMatic: '0x1a22b0BE49D418f4c2304aa356f85Ba0865d790E',





  
  //V1 staking 
  stakeAddress: '0xdDC0b9F299837441b881c0E4FDF091420fe97AbA',
  
  //v2 staking TestNet 
  stakev2AddressMatic1: '0xaF967c5db2A2B84611C9cE1B91F152413B88a57b',
  stakev2AddressMatic2: '0x9dF511fbeF21Fc52b626f565ede80567BCD045Ea',
  stakev2AddressMatic3: '0xAa5aF1b67CF22C8F9153Bd9d7AC3B0e09ac76f56',

  digiTradeAddressMatic: '0x9885775E4099F495A50533908eD147c6b1f5CC25',
  digiTradeAddressBSC: '0x77e7Ec8E78E87B6456f0039B6bD2c3C6AC58CadC',

  digiWaxAddressMatic: '0xC82c5446a7daA1A789b8ac2352137E3EeeD5267B',
  digiWaxAddressEth: '',

  digiTrackAddressMatic: '0x641A33fBfEcF014585ce6d7BA28770997B592443',
  digiTrackAddressBSC: '0x64a6F8dcdc94E7c93fd9752d0Fe7C6b7f55906Aa', // 
  digiTrackAddressEth: '',

  digiAuctionAndMarketPlaceMatic: '0x32399ED9f644B148D671Eda08c153080Ae3B0B2e',
  digiAuctionAndMarketPlaceEth: '',
  // digiAuctionAndMarketPlaceBSC: '0xa4ACe9a3D90fbAe14a4b42698F480f4282a49A2d',
  digiAuctionAndMarketPlaceBSC: '0xd3CecAE082A5cEF1b7BB2FA285A9AB81b0429f4d',
  digiAuctionAndMarketPlaceAvax: '',

  // Special
  digiBulkMintNftNBUMatic: '0x6BC284B9D018fC7f8aC2B42Ea9590e17E4107ecF',
  digiBulkMintNftNBUEth: '',
  digiBulkMintNBUBsc: '',


  deletedNfts: [],
  blocksInEvents: 99999,

  moralis: {
    appId: 'imAomu1AxniYv9w4fYeC11nOkoHwZuAGOmbxCImB',
    serverUrl: 'https://npp1xps7vlrl.usemoralis.com:2053/server'
  },
  
  /* moralis: {
    appId: 'QFpNnUT3RKQJqTg8x2MkoE3povJhSO3u24BOfu1w',
    serverUrl: 'https://pbkyeffgpb1o.usemoralis.com:2053/server'
  }, */
  maticCoinContractAddresses: {
    maticCoinAddress: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
    digiAddressMatic: '0x03d390Af242C8a8a5340489f2D2649e859d7ec2f',
    usdcAddressMatic: '0xDcF513F3E5358467B1a4ec1a78411169a1Fdc5f3',
    linkAddressMatic: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
    usdtAddressMatic: '0xa02f6adc7926efebbd59fd43a84f4e0c0c91e832',
    wethAddressMatic: '',
    wbtcAddressMatic: '',
  },

  bscCoinContractAddresses: {
   
    digiBSCAddress: '0x7144401c72dEa1f577d090F808C541b2A81108FD',
    busdBSCAddress: '0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee',
    wbnbBSCAddress: '',
    usdcBSCAdddress: '0x9780881Bf45B83Ee028c4c1De7e0C168dF8e9eEF',
    soulsBSCAddress: '',
    
  },

  ethCoinContractAddresses: {
    ethCoinAddress: '',
    digiEthAddress: '0xD312460817A60128964bc16E56c4f47fB89F4F21',
    usdcEthAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    usdtEthAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    maticEthAddress: '',
  },

  // maticCurrencyNames: {
     //=====> See CoinList Service. Includes Decimal resolution !!!!
  //   "0x9c3c9283d3e44854697cd22d3faa240cfb032889": 'MATIC',
  //   "0x03d390Af242C8a8a5340489f2D2649e859d7ec2f": 'DIGI',
  //   "0xDcF513F3E5358467B1a4ec1a78411169a1Fdc5f3": 'USDC',
  //   "0x326C977E6efc84E512bB9C30f76E30c160eD06FB": 'LINK',
  //   "0xa02f6adc7926efebbd59fd43a84f4e0c0c91e832": 'USDT',
  // },
  // ethCurrencyNames: {
  //   "0xD312460817A60128964bc16E56c4f47fB89F4F21": 'DIGI',
  //   "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 'USDC',
  //   "0xdAC17F958D2ee523a2206206994597C13D831ec7": 'USDT',
  // },
  // bscCurrencyNames: {
  //   "0x7144401c72dEa1f577d090F808C541b2A81108FD": 'DIGI',
  //   "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56" : 'BUSD',
  // },
  ipfsBaseUri: 'https://ipfs.moralis.io:2053/', // baseUri of moralis ipfs
};
  
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

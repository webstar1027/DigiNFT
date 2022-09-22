import { Injectable } from '@angular/core';
import { nextTick } from 'process';
import { environment } from 'src/environments/environment';
import { ERC20Currency } from '../types/ERC20currency.type';

interface KeyValuePair {
  key: string;
  value: ERC20Currency;
}

export class CoinListService {

// ################## CURRENCIES SECTION ################## 

 //supportedCurrencies: Map<string, ERC20Currency> = new Map<string, ERC20Currency>([


  supportedCurrencies: {[nameAndnetwork: string]: ERC20Currency} = {
    "DIGIMATIC":
    {
      network: "MATIC",
      contractAddress: environment.maticCoinContractAddresses.digiAddressMatic,
      displayName: 'DIGI',
      decimalPlaces: 18,
      logoURL:'https://assets.coingecko.com/coins/images/14960/small/RE3Fiua.png?1619148839'
    },

    "USDTMATIC": {
      network: "MATIC",
      contractAddress: environment.maticCoinContractAddresses.usdtAddressMatic,
      displayName: 'USDT',
      decimalPlaces: 6,
      logoURL: 'https://polygonscan.com/token/images/tether_32.png',
  
    },

    "USDCMATIC": {
      network: "MATIC",
      contractAddress: environment.maticCoinContractAddresses.usdcAddressMatic,
      displayName: 'USDC',
      decimalPlaces: 6,
      logoURL: 'https://polygonscan.com/token/images/centre-usdc_32.png',

    },

    "WETHMATIC": {
      network: "MATIC",
      contractAddress: environment.maticCoinContractAddresses.wethAddressMatic,
      displayName: 'WETH',
      decimalPlaces: 18,
      logoURL: 'https://polygonscan.com/token/images/wETH_32.png',
    },

    "MATICMATIC": {
      network: "MATIC",
      contractAddress: environment.maticCoinContractAddresses.maticCoinAddress,
      displayName: 'MATIC',
      decimalPlaces: 18,
      logoURL: 'https://polygonscan.com/token/images/matic_32.png'

    },

    "LINKMATIC": {
      network: "MATIC",
      contractAddress: environment.maticCoinContractAddresses.linkAddressMatic,
      displayName: 'LINK',
      decimalPlaces: 18,
      logoURL:'https://polygonscan.com/token/images/chainlinktoken_32.png?v=6'

    },

    "WBTCMATIC": {
      network: "MATIC",
      contractAddress: environment.maticCoinContractAddresses.wbtcAddressMatic,
      displayName: 'WBTC',
      decimalPlaces: 8,
      logoURL: 'https://polygonscan.com/token/images/wBTC_32.png',
    },

    // BSC 
    // "DIGIBSC": {
    //   network: "BSC",
    //   contractAddress: environment.bscCoinContractAddresses.digiBSCAddress,
    //   displayName: 'DIGIBSC',
    //   decimalPlaces: 18,
    //   logoURL: 'https://assets.coingecko.com/coins/images/14960/small/RE3Fiua.png?1619148839',
    // },

    "BUSDBSC": {
      network: "BSC",
      contractAddress: environment.bscCoinContractAddresses.busdBSCAddress,
      displayName: 'BUSD',
      decimalPlaces: 18,
      logoURL: 'https://bscscan.com/token/images/busd_32.png',
    },
	
    "WBNBBSC": {
      network: "BSC",
      contractAddress: environment.bscCoinContractAddresses.wbnbBSCAddress,
      displayName: 'WBNB',
      decimalPlaces: 18,
      logoURL: 'https://bscscan.com/token/images/binance_32.png',
    },

    // "SOULSBSC": {
    //   network: "BSC",
    //   contractAddress: environment.bscCoinContractAddresses.soulsBSCAddress,
    //   displayName: 'SOULS',
    //   decimalPlaces: 18,
    //   logoURL: 'https://bscscan.com/token/images/landofimmortals_32.png',
    // },
	}

  getCoinDetails(address: string, network: string): ERC20Currency {
    if (network.toUpperCase() == 'MATIC' ) {
      if (
        address.toUpperCase() ==
        environment.maticCoinContractAddresses.digiAddressMatic.toUpperCase()
      ) {
 
        return this.supportedCurrencies['DIGIMATIC'];
      } 
      else if (
        address.toUpperCase() ==
        environment.maticCoinContractAddresses.usdtAddressMatic.toUpperCase()
      ) {
        return this.supportedCurrencies["USDTMATIC"];
      }  
      else if (
        address.toUpperCase() ==
         environment.maticCoinContractAddresses.usdcAddressMatic.toUpperCase()
       ) {
         return this.supportedCurrencies["USDCMATIC"];
       }
      
      else if (
       address.toUpperCase() ==
        environment.maticCoinContractAddresses.wethAddressMatic.toUpperCase()
      ) {
        return this.supportedCurrencies["WETHMATIC"];
      } else if (
       address.toUpperCase() ==
        environment.maticCoinContractAddresses.maticCoinAddress.toUpperCase()
      ) {
        return this.supportedCurrencies["MATICMATIC"];
      } else if (
       address.toUpperCase() ==
        environment.maticCoinContractAddresses.linkAddressMatic.toUpperCase()
      ) {
        return this.supportedCurrencies["LINKMATIC"];

      } else if (
        address.toUpperCase() ==
        environment.maticCoinContractAddresses.wbtcAddressMatic.toUpperCase()
      ) {
        return this.supportedCurrencies["WBTCMATIC"];
      }
    }

    else if (network.toUpperCase() == 'BSC' ) {
      if (
        address.toUpperCase() ==
        environment.bscCoinContractAddresses.digiBSCAddress.toUpperCase()
      ) {
        return this.supportedCurrencies["DIGIBSC"];
      } 
      else if (
        address.toUpperCase() ==
        environment.bscCoinContractAddresses.busdBSCAddress.toUpperCase()
      ) {
        return this.supportedCurrencies["BUSDBSC"];
      }  
      else if (
        address.toUpperCase() ==
         environment.bscCoinContractAddresses.wbnbBSCAddress.toUpperCase()
       ) {
         return this.supportedCurrencies["WBNBBSC"];
       }
      
      // else if (
      //  address.toUpperCase() ==
      //   environment.bscCoinContractAddresses.soulsBSCAddress.toUpperCase()
      // ) {
      //   return this.supportedCurrencies["SOULSBSC"];
      // }
    }
  }

  getSupportedCurrencyDropDownByNetwork(network: string) {
    var currencyDropDown = [];
    for (let key in this.supportedCurrencies) {
      let ERC20currency = this.supportedCurrencies[key];
      if (ERC20currency.network != network) continue;

      currencyDropDown.push({
        name: ERC20currency.displayName,
        id: ERC20currency.contractAddress
      });
    }
    return currencyDropDown;
  }

}
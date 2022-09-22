import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Moralis } from 'moralis';
import { HelpersService } from './helpers.service';
import { WalletService } from './wallet.service';
import { DigiCard } from '../types/digi-card.types';
import { AppComponent } from '../app.component';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable()
export class MoralisService {
  constructor(
    private readonly helpers: HelpersService,
    private readonly wallet: WalletService,
    private sanitizer: DomSanitizer
  ) {}

  private getChain(network: string) {
    let chain: any;
    if (environment.production) {
      if(network == "MATIC"){
        chain = 'Matic';
      }
      else if(network == "BSC"){
        chain = 'bsc';
      }

      
    } else {
      if(network == "MATIC"){
        chain = 'Mumbai';
      }
      else if(network == "BSC"){
        chain = 'bsc testnet';
      }
    }
    return chain;
  }

  async getNFTsForContract(
    network: string,
    walletAddress: string,
    tokenAddress: string
  ) {
    let chain;
    if (network === 'MATIC') {
      if (environment.production) {
        chain = 'Matic';
      } else {
        chain = 'mumbai';
      }
    }
    const options: any = {
      chain: chain,
      address: walletAddress,
      token_address: tokenAddress,
    };
    return await Moralis.Web3API.account.getNFTsForContract(options);
  }

  async getCurrentUser(): Promise<any> {
    const user: any = await Moralis.User.current();
    return user;
  }

  async getNFTTrades(
    address: string,
    limit: number,
    network: string
  ): Promise<any> {
    const options: any = { address: address, limit: limit, chain: network };
    const NFTTrades = await Moralis.Web3API.token.getNFTTrades({
      address: address,
      limit: limit,
      chain: this.getChain(network),
    });
  }

  async reSyncMetadata(
    address: string,
    tokenId: string,
    flag?: string
  ): Promise<any> {
    /* return await Moralis.Web3API.token.reSyncMetadata({
      address: address,
      token_id: tokenId,
      flag: 'uri',
    }); */
  }

  async getWalletTokenIdTransfers(
    address: string,
    tokenId: string,
    network: string
  ): Promise<any> {
    const options: any = { address: address, token_id: tokenId, chain: network };
    const transfers = await Moralis.Web3API.token.getWalletTokenIdTransfers({
      address: address,
      token_id: tokenId,
      chain: this.getChain(network),
    });
    return transfers;
  }

  async getTransactionByHash(transactionHash: string, network:string) {
    const options = {
      chain: this.getChain(network),
      transaction_hash: transactionHash,
    };
    return await Moralis.Web3API.native.getTransaction(options);
  }

  async getNftDataFromMoralis(
    tokenAddress: string,
    tokenId: string,
    network: string
  ) {
    var _chain = this.getChain(network);
    console.log("Getting NFT Moralis data from ", _chain);
    let nftData = await Moralis.Web3API.token.getTokenIdMetadata({
      address: tokenAddress,
      token_id: tokenId,
      chain: this.getChain(network),
    });
    // console.log(nftData)
    let tokenData;
    if (nftData.token_uri) {
      tokenData = await this.getTokenURIData(nftData.token_uri);
    }

    return { ...nftData, tokenData: tokenData };
  }

  private getTokenURIData(urlValue): Promise<any> {
    let url = urlValue;
    if (!url || url.indexOf('http://') != -1) {
      return;
    }
    if (url && url.indexOf('ipfs://') != -1) {
      console.log('BAD URL:', url);
      const rep = url.replace(/^ipfs?:\/\//, '');
      url = `https://digible.mypinata.cloud/ipfs/${rep}`;
    }
    const link: any = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    url = link.changingThisBreaksApplicationSecurity;
    const parseJson = async (response) => {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return json;
      } catch (err) {
        // throw new Error('Did not receive JSON, instead received: ' + text);
      }
    };
    // https://api.opensea.io/api/v2/metadata/matic/0x2953399124F0cBB46d2CbACD8A89cF0599974963/0xb3397a6feedff2b9fce9ca1086cb1bdd617c16bf0000000000000c0000002710
    let headers;
    if (url && url.indexOf('https://api.digible.io') != -1) {
      return;
    }
    if (url && url.indexOf('https://api.opensea.io') != -1) {
      headers = {
        headers: {
          'X-API-KEY': '7d2635eedf054d8eae7638cca334fb7e',
          mode: 'no-cors',
        },
      };
    }
    if (
      (url && url.indexOf('https://www.ferratipeace.club') != -1) ||
      url.indexOf('https://api2.mekafight.com') != -1 ||
      url.indexOf('https://api2.cryptopunksbunnies.com') != -1 ||
      url.indexOf('https://www.thehighapesclub.com') != -1
    ) {
      headers = {
        headers: {
          mode: 'no-cors',
        }
      };
    }
    const digiData = fetch(url, headers)
      .then(parseJson)
      .then((result) => {
        if (result && result.statusCode === 404) return;
        if (!result) return;
        return result;
      });
    return digiData;
  }

  async getAllTokensByContractAddressAndNetwork(
    contractAddress: string,
    chain?: string,
    limit?: number,
    offset?: number
  ): Promise<DigiCard[]> {
    if (!offset) {
      offset = 0;
    }

    let chainId;
    if (environment.production) {
      chainId = 'Matic';
    } else {
      chainId = 'mumbai';
    }
    try {
      let digiCards = [];
      const tokens = await Moralis.Web3API.token.getAllTokenIds({
        address: contractAddress,
        chain: chainId,
        offset: offset,
        limit: limit,
      });
      tokens.result.forEach(async (element, index) => {
        if (element.token_uri.indexOf('https://api.digible.io') != -1) {
          return;
        }
        if (element.token_uri && element.token_uri.indexOf('ipfs://') != -1) {
          console.log('BAD URL:', element.token_uri);
          const rep = element.token_uri.replace(/^ipfs?:\/\//, '');
          element.token_uri = `https://digible.mypinata.cloud/ipfs/${rep}`;
        }
        if (element.token_uri) {
          await this.getTokenURIData(element.token_uri).then(
            (tokenData: any) => {
              if (typeof tokenData === 'object' && tokenData !== null) {
                let sameItem = digiCards.find(dc => dc.id === element.token_id);
                if (!sameItem) {
                  digiCards.push({
                    ...element,
                    id: element.token_id,
                    network: 'MATIC',
                    tokenData: tokenData,
                  });
                }
              }
            }
          );
        }
      });
      return digiCards;
    } catch (e) {
      console.log(e);
    }
  }


  async getAllNFTsByWalletAddressAndNetwork(address: string, network: string) {
  let _chain = this.getChain(network);

    let digiCards = [];
    const tokens = await Moralis.Web3API.account.getNFTs({
      chain: _chain,
      address: address,
    });
    const promiseArray = [];
    tokens.result.forEach(async (element, index) => {
      if (element.token_uri) {
        if (element.token_uri.indexOf('https://api.digible.io') != -1) {
          return;
        }
        if (element.token_uri.indexOf('ipfs://') != -1) {
          console.log('BAD URL:', element.token_uri);
          const rep = element.token_uri.replace(/^ipfs?:\/\//, '');
          element.token_uri = `https://digible.mypinata.cloud/ipfs/${rep}`;
        }
        promiseArray.push(this.getTokenURIData(element.token_uri).catch((err) => { return {err}}));
      }
    });
    
    const promiseData = await Promise.all(promiseArray);
    console.log(promiseData, 'promiseData');
    promiseData.forEach((tokenData, idx) => {
      if (typeof tokenData === 'object' && tokenData !== null) {
        if (tokenData.image) {
          let safe: any = this.sanitizer.bypassSecurityTrustResourceUrl(
            tokenData.image
          );
          tokenData.image = safe;
        }
        digiCards.push({
          ...tokens.result[idx],
          id: tokens.result[idx].token_id,
          network: network,
          tokenData: tokenData,
        });
      }
    });
    console.log(digiCards, digiCards.length, 'digiCards');
    return digiCards;
  }

  // async getAllNFTsByWalletAddress(address: string): Promise<any> {
  //   let maticChain;
  //   if (environment.production) {
  //     maticChain = 'Matic';
  //   } else {
  //     maticChain = 'mumbai';
  //   }
  //   let digiCards = [];
  //   const tokens = await Moralis.Web3API.account.getNFTs({
  //     chain: maticChain,
  //     address: address,
  //   });
  //   tokens.result.forEach(async (element, index) => {
  //     if (element.token_uri) {
  //       if (element.token_uri.indexOf('https://api.digible.io') != -1) {
  //         return;
  //       }
  //       if (element.token_uri.indexOf('ipfs://') != -1) {
  //         console.log('BAD URL:', element.token_uri);
  //         const rep = element.token_uri.replace(/^ipfs?:\/\//, '');
  //         element.token_uri = `https://digible.mypinata.cloud/ipfs/${rep}`;
  //       }
  //       await this.getTokenURIData(element.token_uri).then((tokenData: any) => {
  //         if (typeof tokenData === 'object' && tokenData !== null) {
  //           if (tokenData.image) {
  //             let safe: any = this.sanitizer.bypassSecurityTrustResourceUrl(
  //               tokenData.image
  //             );
  //             tokenData.image = safe;
  //           }
  //           digiCards.push({
  //             ...element,
  //             id: element.token_id,
  //             network: 'MATIC',
  //             tokenData: tokenData,
  //           });
  //         }
  //       });
  //     }
  //   });
  //   return digiCards;
  // }

  async getNFTTransfers(address: string): Promise<any> {
    let maticChain;
    if (environment.production) {
      maticChain = 'Matic';
    } else {
      maticChain = 'mumbai';
    }
    const options = {
      chain: maticChain,
      address: address,
      order: 'desc',
      from_block: '0',
    };
    return await Moralis.Web3API.account.getNFTTransfers({
      chain: maticChain,
      address: address,
      limit: 10,
    });
  }

  async connectWallet(provider) {
    AppComponent.myapp.login(provider);
  }
}

import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { ExecOptionsWithStringEncoding } from 'child_process';
import { WalletService } from 'src/app/services/wallet.service';
import { environment } from 'src/environments/environment';
import { NftService } from './nft.service';

@Injectable()
export class DigiWaxService {

  constructor(
    private http: HttpClient,
    private readonly wallet: WalletService,
    private readonly nft: NftService
  ) {
    this.setDigiWaxContract();
  }
  digiWaxAddress = environment.digiWaxAddressMatic;
  digiWaxContract;

  currentAccount: string;

  async setDigiWaxContract() {
    this.digiWaxContract = await this.getDigiWaxContract(
      true,
      'MATIC'
    );
  }

  async getParticipantWalletsByBoxName(boxName: string, index: number): Promise<any> {

    const result = await this.digiWaxContract.methods
      .participantWallets_by_boxName_map(boxName, index)
      .call();
    return result;

  }

  async accessPriceByBoxName(boxName: string): Promise<any> {
    const result = await this.digiWaxContract.methods
      .accessPrice_by_boxName_map(boxName)
      .call();
    return result;
  }

  async accessFeePercentage(): Promise<any> {
    const result = await this.digiWaxContract.methods
      .access_fee_percentage()
      .call();
    return result;
  }

  async breakWaxBox(boxName: string): Promise<any> {
    const result = await this.digiWaxContract.methods
      .breakWax_Box(boxName)
      .call();
    return result;
  }

  async getBoxOwner(boxName: string): Promise<any> {
    const result = await this.digiWaxContract.methods
      .boxOwner_map(boxName)
      .call();
    return result;
  }



  async accessPriceContractAddressByBoxName(boxName: string) {
    const result = await this.digiWaxContract.methods
      .accessPriceContractAddress_by_boxName_map(boxName)
      .call();
    return result;
  }

  async subscribeWalletToBoxByName(network: string, boxName: string, subscriberAddress: string) {
    const from = await this.getAccount();
    console.log("Subscribe to ", boxName, from);
    return await (await this.getDigiWaxContract(false, network)).methods
      .subscribeWalletToBoxByName(boxName, subscriberAddress)
      .send({ from });

  }

  async subscribeWalletToBoxUsingKey(
    network: string,
    boxName: string,
    subscriberAddress: string,
    digiKeyAddress: string,
    digiKeyTokenId: number
  ) {
    const from = await this.getAccount();
    console.log("Subscribe using Key ", digiKeyAddress, digiKeyTokenId, boxName, from);
    return await (await this.getDigiWaxContract(false, network)).methods
      .subscribeWalletToBoxByRequestIdUsingKey(boxName, subscriberAddress, digiKeyAddress,digiKeyTokenId )
      .send({ from });
  }


  async updateSubscriptionsByBox(
    network: string,
    boxName: string,
    isGenSubOpen: boolean,
    isKeySubOpen: boolean
  ) {
    const from = await this.getAccount();
    return await (await this.getDigiWaxContract(false, network)).methods
      .updateSubscriptionsByBox(boxName, isGenSubOpen, isKeySubOpen)
      .send({from});
 
  }

  async oracleSpokeByBoxName(boxName: string) {
    const result = await this.digiWaxContract.methods
      .oracleSpoke_by_boxName_map(boxName)
      .call();
    return result;
  }

  // Check if General Subscription is open
  async generalSubscriptionOpen_by_boxName_map(boxName: string): Promise<any> {
    const result = await this.digiWaxContract.methods
      .generalSubscriptionOpen_by_boxName_map(boxName)
      .call();
    return result;
  }

  // Check if DigiKey Subscription is open
  async digikeySubscriptionOpenByBoxName(boxName: string): Promise<any> {
    const result = await this.digiWaxContract.methods
      .digikeySubscriptionOpen_by_boxName_map(boxName)
      .call();
    return result;
  }

  // Get participant Wallets By Box Name and Array index
  /* async participantWalletsByBoxName(boxName: string): Promise<any> {
    const result = await this.digiWaxContract.methods
      .participantWallets_by_boxName_map(boxName, 1)
      .call();
    console.log(result);
    return result;
  } */

  // Get participant Wallets By Box Name and Array index
  async WalletSubscribed(boxName: string, walletAddress: string): Promise<any> {
    const fromBlock =
      (await this.wallet.getMaticInfuraWeb3().eth.getBlockNumber()) -
      environment.blocksInEvents;

    return new Promise(async (resolve, reject) => {
      this.digiWaxContract.getPastEvents(
        'WalletSubscribed',
        {
          boxname: boxName,
          wallet: walletAddress,
          usedKey: true,
          fromBlock: 0,
          toBlock: 'latest'
        },
        (error, events) => {
          if (error) {
            reject(error);
          } else {
            resolve(events);
          }
        }
      );
    });
  }

  // Check boxSealed By RequestId
  async boxSealedByRequestId(requestId: string): Promise<any> {
    const result = await this.digiWaxContract.methods
      .boxSealed_By_requestId_map(requestId)
      .call();
    return result;
  }

  async digiKeyAddressByBoxName(boxName: string, index: number): Promise<any> {
    const result = await this.digiWaxContract.methods
      .digiKeyAddressesArr_by_boxName_map(boxName, index)
      .call();
    return result;
  }


  async digiKeytokenByBoxName(boxName: string, index: number): Promise<any> {
    const result = await this.digiWaxContract.methods
      .digiKeyTokensArr_by_boxName_map(boxName, index)
      .call();
    return result;
  }

  
  async digiKeytokenAllowedByBoxName(boxName: string, keyAdress: string, keyTokenId: number): Promise<any> {
    const result = await this.digiWaxContract.methods
      .digiKeyAllowed_byBoxName_3map(boxName, keyAdress, keyTokenId)
      .call();
    return result;
  }


  async getRequestIdByBoxName(boxName: string) {
    const requestId = await this.digiWaxContract.methods
      .requestId_by_boxName_map(boxName)
      .call();
    return requestId;
  }

  async getTotalSpotsByBoxName(boxName: string) {

    const spots = await this.digiWaxContract.methods
      .getTotalSpotsByBoxName(boxName)
      .call();
    return spots;


  }


  async getTotalWalletsByBoxName(boxName: string) {

    const result = await this.digiWaxContract.methods
      .getTotalWalletsByBoxName(boxName)
      .call();
    return result;


  }


  async getTotalKeysByBoxName(boxName: string) {

    const result = await this.digiWaxContract.methods
      .getTotalKeysByBoxName(boxName)
      .call();
    return result;


  }


  async getBoxNFTAddress(boxName: string, index: number) : Promise<string> {
    const result = await this.digiWaxContract.methods
    .nftContractAddressesArr_by_boxName_map(boxName, index)
    .call();
  return result;

  }

  async getBoxNFTtokenId(boxName: string, index: number) : Promise<any> {
    const result = await this.digiWaxContract.methods
    .tokensArr_by_boxName_map(boxName, index)
    .call();
  return result;

  }

  async getWalletSubscribedByBox(boxName: string, wallet: string) : Promise<any> {
    const result = await this.digiWaxContract.methods
    ._walletSubscribed_by_boxName_map(boxName, wallet)
    .call();
  return result;

  }

  private async getDigiWaxContract(
    readonly?: boolean,
    network?: string
  ): Promise<any> {
    const abi = require('../../assets/abis/digiwaxabi.json');
    if (readonly) {
      if (network === 'MATIC') {
        return new (this.wallet.getMaticInfuraWeb3().eth.Contract)(
          abi,
          environment.digiWaxAddressMatic
        );
      } else if (network === 'ETH') {
        return new (this.wallet.getInfuraWeb3().eth.Contract)(
          abi,
          environment.digiWaxAddressEth
        );
      }
    } else {
      if (network === 'MATIC') {
        return new (this.wallet.getWeb3().eth.Contract)(
          abi,
          environment.digiWaxAddressMatic
        );
      } else if (network === 'ETH') {
        return new (this.wallet.getWeb3().eth.Contract)(
          abi,
          environment.digiWaxAddressEth
        );
      }
    }
  }

  private async getAccount(): Promise<string | null> {
    if (!this.currentAccount) {
      this.currentAccount = await this.wallet.getAccount();
    }
    return this.currentAccount;
  }
}


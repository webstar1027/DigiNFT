import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { address } from '@maticnetwork/maticjs/dist/ts/types/Common';
import { ExecOptionsWithStringEncoding } from 'child_process';
import { env } from 'process';
import { WalletService } from 'src/app/services/wallet.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class DigiTrackService {
  constructor(
    private http: HttpClient,
    private readonly wallet: WalletService
  ) {
    this.setDigiTrackContract(this.defaultNetwork);
  }

 //##########################################################################
    // SMART CONTRACT NETWORK, CONNECTIVITY, SPEND APPROVALS CONFIGURATION
 // USE THIS VAR TO CHECK IF THIS SERVICE SUPPORTS NETWORK IS CURRENTLY ON.
 
 public suportedNetworks = ['MATIC'];
 public defaultNetwork = 'MATIC';

 // IF ADDING NEW NETWORKS  SET ADDITIONAL CORRECT NETOWRK ENV VARS x2 IN getDigiTradeContract() below

public getMyContractAddressByNetwork(network: string){
  if (network === 'MATIC') {
    return  environment.digiTrackAddressMatic;
    
  } else if (network === 'BSC') {
    return environment.digiTrackAddressBSC;
  
  }

}


  
  digiTrackContract;
  currentAccount;
  phygitalStatuses = [
    "Digisafe - Redemption Ready",
    "Digisafe - Pending Grade",
    "Digi Authentication Pending",
    "Rejected",
    "Redeemed"
  ]

  async setDigiTrackContract(network:string) {
    this.digiTrackContract = await this.getDigiTrackContract(
      true,
      network
     
      
    );
  }

    
  async isWalletDigiSafe(_walletAddress): Promise<any> {
  
    const result = await this.digiTrackContract.methods
      .hasRole('0x5cc3257ddf2cf0b55d4fe73dde4c462a068a696d19b4b0f5e81a90f679fff734', _walletAddress)
      .call();
    return result;
  }

  

  
  async accessgetStatus(_nftAddress: address, _tokenId: number ): Promise<any> {
    const result = await this.digiTrackContract.methods
      .getStatus(_nftAddress, _tokenId)
      .call();
    return result;
  }

  async updateStatusBulk(_nftAddress: address, _startTokenId: number, _endTokenId: number, _newStatus:string, network:string, digiSafeAddress: string  ): Promise<any> {
    const from = await this.getAccount();
    return await (await this.getDigiTrackContract(false, network)).methods
    .updateStatusBulk(_nftAddress, _startTokenId, _endTokenId, _newStatus, digiSafeAddress)
      .send({ from });
    
    
  }

  async updateStatus(_nftAddress: address, _tokenId: number, _newStatus:string, network:string, digiSafeAddress: string ): Promise<any> {
    
    
    console.log("Updating Status to ", _newStatus, digiSafeAddress);
    const from = digiSafeAddress;
    return await (await this.getDigiTrackContract(false, network)).methods
    .updateStatus(_nftAddress, _tokenId, _newStatus, digiSafeAddress)
      .send({ from });

  }

  private async getDigiTrackContract(
   
    readonly?: boolean,
    network?: string
  ): Promise<any> {
    const abi = require('../../assets/abis/digiTrackabi.json');
    if (readonly) {
      if (network === 'MATIC') {
        return new (this.wallet.getMaticInfuraWeb3().eth.Contract)(
          abi,
          environment.digiTrackAddressMatic
        );
      } else if (network === 'ETH') {
        return new (this.wallet.getInfuraWeb3().eth.Contract)(
          abi,
          environment.digiTrackAddressEth
        );
      }
    } else {
      if (network === 'MATIC') {
        return new (this.wallet.getWeb3().eth.Contract)(
          abi,
          environment.digiTrackAddressMatic
        );
      } else if (network === 'ETH') {
        return new (this.wallet.getWeb3().eth.Contract)(
          abi,
          environment.digiTrackAddressEth
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


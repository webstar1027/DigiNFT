import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExecOptionsWithStringEncoding } from 'child_process';
import { env } from 'process';
import { WalletService } from 'src/app/services/wallet.service';
import { environment } from 'src/environments/environment';
import { digitradeOffer } from '../types/digitrade-offer.type';

@Injectable()
export class DigiService {
  constructor(
    private http: HttpClient,
    private readonly wallet: WalletService
  ) {
    
  }

  getDigiNFTPublicMintContractAddressByNetwork(network: string) {
		
    
    if(network == 'BSC'){
        return environment.nftAddressBSC
    } 
    else if (network == 'MATIC') {
        return environment.nftAddressMatic;
    }

    else if (network == 'ETH') {
        return environment.nftAddress;
    }

}


getDigiNFTPublicMultiMintContractAddressByNetwork(network: string) {
		
    
    if(network == 'BSC'){
        return environment.nftBulkMintAddressBSC
    } 
    else if (network == 'MATIC') {
        return environment.nftBulkMintAddressMatic;
    }

    else if (network == 'ETH') {
        return environment.nftBulkMintAddress;
    }

}

getDigiCubeNFTContractAddressByNetwork(network: string) {
		
    
    if(network == 'BSC'){
        return environment.nftCubesAddressBSC;
    } 
    else if (network == 'MATIC') {
        return environment.nftCubesAddressMatic;
    }
 

}

getDigiKeysNFTContractAddressByNetwork(network: string) {
		
    
 if (network == 'MATIC') {
        return environment.nftKeysAddressMatic;
    }
 

}

getLOINFTContractAddressByNetwork(network: string) {
		
    
    if (network == 'BSC') {
           return environment.nftDigiLOIBSC;
       }
    
   
   }


   getUkraineMintContractAddressByNetwork(network: string) {
		
    
    if (network == 'BSC') {
           return environment.ukraineMintBsc;
       }
    
   
   }






  getDigiContractAddressByNetwork(network: string) {
		
    
    if(network == 'BSC'){
        return environment.bscCoinContractAddresses.digiBSCAddress;
    } 
    else if (network == 'MATIC') {
        return environment.maticCoinContractAddresses.digiAddressMatic;
    }

    else if (network == 'ETH') {
        return environment.ethCoinContractAddresses.digiEthAddress;
    }

}


  async getDigiBalanceByNetwork(network: string ): Promise<number>{


    var digiBalance = await this.wallet.tokenBalance(this.getDigiContractAddressByNetwork(network));
   
	return digiBalance;
		

	}


}
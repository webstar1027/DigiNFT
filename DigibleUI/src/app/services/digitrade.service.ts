// THIS IS A DIGITRADE SMART CONTRACT SERVICE.


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExecOptionsWithStringEncoding } from 'child_process';
import { boolean } from 'mathjs';
import { env, off } from 'process';
import { WalletService } from 'src/app/services/wallet.service';
import { environment } from 'src/environments/environment';
import { digitradeOffer } from '../types/digitrade-offer.type';

@Injectable()
export class DigiTradeService {
  constructor(
    private http: HttpClient,
    private readonly wallet: WalletService
  ) {
    
  }

  //##########################################################################
    // SMART CONTRACT NETWORK, CONNECTIVITY, SPEND APPROVALS CONFIGURATION
 // USE THIS VAR TO CHECK IF THIS SERVICE SUPPORTS NETWORK IS CURRENTLY ON.
 public suportedNetworks = ['MATIC'];

 // IF ADDING NEW NETWORKS  SET ADDITIONAL CORRECT NETOWRK ENV VARS x2 IN getDigiTradeContract() below

public getMyContractAddressByNetwork(network: string){
  if (network === 'MATIC') {
    return  environment.digiTradeAddressMatic;
  } else if (network === 'BSC') {
    return environment.digiTradeAddressBSC;
  }
}

 private async getDigiTradeContract(
   
    readonly?: boolean,
    network?: string
  ): Promise<any> {
    const abi = require('../../assets/abis/digiTradeAbi.json');

    if(!network){
      network = environment.defaultNetwork;
  }
  
    // FOR READING THE BLOCKCHAIN ONLY
    if (readonly) {
      console.log(this.getMyContractAddressByNetwork(network));
      return new (this.wallet.getWeb3ByNetwork(network).eth.Contract)(
        abi,
        this.getMyContractAddressByNetwork(network)
      );
    
  }
    // FOR SENDING TRANSACTIONS TO THE BLOCKCHAIN
    else {
          
      return new (this.wallet.getWeb3ByNetwork(network).eth.Contract)(
          abi,
          this.getMyContractAddressByNetwork(network)
      );
  
      }
}

// CHECK IF THIS CONTRACT IS APPROVED TO SPEND ERC20

public async HowMuchAmIApprovedToSpendErc20(network: string, erc20address: string): Promise<number> {
 
      console.log('Checking Approval', this.getMyContractAddressByNetwork(network), network, erc20address);
      
      const approval = await this.wallet.checkApprovalToSpendErc20(
        this.getMyContractAddressByNetwork(network), network, erc20address);
        console.log(' Approval', approval);
        return approval;
 
}



public  async approveMeToSpendErc20(network: string, erc20address: string): Promise<void> {
    
    return await this.wallet.approveSpendErc20(this.getMyContractAddressByNetwork(network), network, erc20address);

}
async amIApprovedAllERC721(
  nftAddress: string,
  owner: string,
  network: string
): Promise<boolean> {
  const abi = require('../../assets/abis/erc721.json');
  const nft = new (this.wallet.getWeb3().eth.Contract)(abi, nftAddress);
  return await nft.methods.isApprovedForAll(owner,  this.getMyContractAddressByNetwork(network)).call();
}


public  async approveMeAllERC721(network: string, erc721address: string): Promise<void> {
  
      return await this.wallet.approveAllErc721(erc721address, this.getMyContractAddressByNetwork(network));
  
}




// ############ CORE FUNCTIONS OF SMART CONTRACT #######################


async makeOffer(offer: digitradeOffer): Promise<string>  {

return await this.makeOfferRaw(
  offer.wallets[1], // other wallet (receipient of offer)
  offer.addresses[2], // ERC20 token offered
  offer.erc20QtyOffered,
  offer.addresses[0], // ERC721 offered 1
  offer.nftTokenIds[0],
  offer.addresses[1],  // ERC721 offered 2
  offer.nftTokenIds[1],
  offer.addresses[3], // ERC721 requested1
  offer.nftTokenIds[2],
  offer.addresses[4],   // ERC721 requested1
  offer.nftTokenIds[3],
  offer.addresses[5], // ERC20 token requested
  offer.erc20QtyRequested
  
  
  
  
  )

}



// returns offerId
async makeOfferRaw(    
    otherWallet: string,
    addressTokenOffered: string | null,
    quantityTokenOffered: string | null,
    addressNftOffered1: string | null,
    tokenIdNftOffered1: string | null,
    addressNftOffered2: string | null,
    tokenIdNftOffered2: string | null,
    addressNftRequested1: string | null,
    tokenIdNftRequested1: string | null,
    addressNftRequested2: string | null,
    tokenIdNftRequested2: string | null,
    addressTokenRequested: string | null,
    quantityTokenRequested: string | null,   
    
    ): Promise<string> {
    
      console.log("Making Offer to", otherWallet);
    if(!quantityTokenOffered && !tokenIdNftOffered1 && !tokenIdNftOffered2) {
        console.log("Nothing Offered. Exiting")
        return "Nothing Offered. Exiting";
    }

    if(!quantityTokenRequested && !tokenIdNftRequested1 && !tokenIdNftRequested2) {
        console.log("Nothing Requested. Exiting")
        return "Nothing Requested. Exiting";
    }

    // FORMAT FOR SMART CONTRACT
    if(!addressTokenOffered) {
        addressTokenOffered = "0x0000000000000000000000000000000000000000";
        quantityTokenOffered = "0";

    }

    if(!addressNftOffered1) {
        addressNftOffered1 = "0x0000000000000000000000000000000000000000";
        tokenIdNftOffered1 = "0";

    }

    if(!addressNftOffered2) {
        addressNftOffered2 = "0x0000000000000000000000000000000000000000";
        tokenIdNftOffered2 = "0";

    }

    if(!addressNftRequested1) {
        addressNftRequested1 = "0x0000000000000000000000000000000000000000";
        tokenIdNftRequested1 = "0";

    }

    if(!addressNftRequested2) {
        addressNftRequested2 = "0x0000000000000000000000000000000000000000";
        tokenIdNftRequested2 = "0";

    }

    if(!addressTokenRequested) {
        addressTokenRequested = "0x0000000000000000000000000000000000000000";
        quantityTokenRequested = "0";

    }

    // 6 addresses
    const addresses = [addressNftOffered1, addressNftOffered2, addressTokenOffered, addressNftRequested1, addressNftRequested2,addressTokenRequested];
    // 4 tokenIds
    const tokenIds = [tokenIdNftOffered1,tokenIdNftOffered2, tokenIdNftRequested1,tokenIdNftRequested2];

    // for details see smart contract or digitrade-offer.types.ts
       
    let network = await this.getNetwork();
    const estimateGas = await (await this.getDigiTradeContract(false, network)).methods
    .makeOffer(
        otherWallet,
        addresses,
        tokenIds,
        quantityTokenOffered,
        quantityTokenRequested
    )
    .estimateGas({ from: await this.getAccount()});
    console.log(estimateGas);
    return await (await this.getDigiTradeContract(false, network)).methods
      .makeOffer(
          otherWallet,
          addresses,
          tokenIds,
          quantityTokenOffered,
          quantityTokenRequested
          )
      .send({ from: await this.getAccount(), gas: estimateGas + 4500000});
  }


 async acceptOffer(orderId: string): Promise<boolean> {
    
    let network = await this.getNetwork();
    return await (await this.getDigiTradeContract(false, network)).methods
      .acceptOffer(orderId)
      .send({ from: await this.getAccount() });
  }


  async cancelOffer(orderId: string): Promise<boolean> {
    
    let network = await this.getNetwork();
    return await (await this.getDigiTradeContract(false, network)).methods
      .cancelOffer(orderId)
      .send({ from: await this.getAccount() });
  }


  async getOfferDetails(orderId: string, account?: string): Promise<digitradeOffer | boolean> {
    let from;
    if (account) {
      from = account;
    } else {
      from = await this.getAccount();
    }
    if (!from) {
      return false;
    }
    
    let network = await this.getNetwork();
    console.log("getting offer for", orderId, network);
    return await (await this.getDigiTradeContract(false, network)).methods
      .offerMap(orderId)
      .call();
  }

  async getOfferIds_by_wallet (wallet: string, network: string) : Promise<any []>{

    var checkOffers = true;
    var index = 0;
    var offers: any[] = []; 
    while(checkOffers){

      try {
        var result = await (await this.getDigiTradeContract(false, network)).methods
        .offerIds_by_wallet_map(wallet, index)
        .call();
        index += 1;
        offers.push(result)
      } catch (error) {
       
       
        checkOffers = false;
      }


    }
    
    console.log("offerIds", offers);
    return offers;

  }


  async getFeeCurrencyAddress(account?: string): Promise<string> {
    let from;
    if (account) {
      from = account;
    } else {
      from = await this.getAccount();
    }
    if (!from) {
      return "";
    }
    
    let network = await this.getNetwork();
    return await (await this.getDigiTradeContract(true, network)).methods
      .DIGI()
      .call();
  }



  async getFeeToMakeOffer(network?: string): Promise<number> {
    
    if(!network) { network = await this.getNetwork(); }
    var k = await this.getDigiTradeContract(false, network)
    console.log("K:", k);
    var fee= await k.methods
      .gasFee_MakeOffer()
      .call();
      console.log("Got make offer Fee", fee);
      return fee;

  }



  async getFeeToAcceptOffer(network?: string): Promise<number> {
       
    if(!network) { network = await this.getNetwork(); }
    var fee = await (await this.getDigiTradeContract(false, network)).methods
      .gasFee_AcceptOffer()
      .call();
      console.log("Got accept offer Fee", fee);
      return fee;
  }


   



// KEYHOLDER ROLE: ALLOWS TO MAKE DIGITRADES WITHOUT A FEE FOR INITIATING / ACCEPTING
  async isKeyholder(account?: string): Promise<boolean> {
    let from;
    if (account) {
      from = account;
    } else {
      from = await this.getAccount();
    }
    if (!from) {
      return false;
    }
    const keyHolderRole =
      '0x6d612b3fde744b74adc89304d13d4171d7999bba96e228aa3dd670050e4cd1a1';
    let network = await this.getNetwork();
    return await (await this.getDigiTradeContract(true, network)).methods
      .hasRole(keyHolderRole, from)
      .call();
  }

  // ONLY DIGIBLE ADMIN ROLE WALLETS CAN GRANT ROLES
  async grantKeyHolderRole(account: string): Promise<void> {
    const keyHolderRole =
      '0x6d612b3fde744b74adc89304d13d4171d7999bba96e228aa3dd670050e4cd1a1';
    let network = await this.getNetwork();
    return await (await this.getDigiTradeContract(false, network)).methods
      .grantRole(keyHolderRole, account)
      .send({ from: await this.getAccount() });
  }


   // FOR DIGIBLE ADMIN USE ONLY
  async isAdmin(account?: string): Promise<boolean> {
    let from;
    if (account) {
      from = account;
    } else {
      from = await this.getAccount();
    }
    if (!from) {
      return false;
    }
    const adminRole =
      '0x0000000000000000000000000000000000000000000000000000000000000000';
    let network = await this.getNetwork();
    return await (await this.getDigiTradeContract(true, network)).methods
      .hasRole(adminRole, from)
      .call();
  }



  

  

  private async getAccount(): Promise<string | null> {
    
    var currentAccount = await this.wallet.getAccount();    
    return currentAccount;
  }

  private async getNetwork(): Promise<string | null> {

    var currentNetwork = await this.wallet.getNetwork();
    return currentNetwork;
  }
}


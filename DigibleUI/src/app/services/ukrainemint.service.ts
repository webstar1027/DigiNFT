import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExecOptionsWithStringEncoding } from 'child_process';
import { i } from 'mathjs';
import { env } from 'process';
import { WalletService } from 'src/app/services/wallet.service';
import { environment } from 'src/environments/environment';


@Injectable()
export class UkraineMintService {
    constructor(
        private http: HttpClient,
        private readonly wallet: WalletService
    ) {

    }

    //##########################################################################
    // SMART CONTRACT NETWORK, CONNECTIVITY, SPEND APPROVALS CONFIGURATION

    // USE THIS suportedNetworks TO CHECK IF THIS SERVICE SUPPORTS NETWORK IS CURRENTLY ON.
    public suportedNetworks = ['BSC'];

    public getMyContractAddressByNetwork(network: string){
        if (network == 'BSC') {
          return  environment.ukraineMintBsc;
          
        }
      
      }

    // IF ADDING NEW NETWORKS  SET ADDITIONAL CORRECT NETOWRK ENV VARS x2 IN getUkraineMintContract() below
    private async getUkraineMintContract(

        readonly?: boolean,
        network?: string
    ): Promise<any> {
        const abi = require('../../assets/abis/ukraineMintAbi.json');

        if(!network){
            network = environment.defaultNetwork;
        }
        // FOR READING THE BLOCKCHAIN ONLY
        if (readonly) {
            
              return new (this.wallet.getWeb3ByNetwork(network).eth.Contract)(
                abi,
                this.getMyContractAddressByNetwork(network)
              );
            
          }

        // FOR SENDING TRANSACTIONS TO THE BLOCKCHAIN
        else {
          
                return new (this.wallet.getWeb3().eth.Contract)(
                    abi,
                    this.getMyContractAddressByNetwork(network)
                );
            

        }
    }

    // CHECK IF THIS CONTRACT IS APPROVED TO SPEND ERC20

   public async HowMuchAmIApprovedToSpendErc20(network: string, erc20address: string): Promise<number> {
       
    console.log('Ukraine Mint Checking Approval', environment.ukraineMintBsc, network, erc20address);
    return await this.wallet.checkApprovalToSpendErc20(
        this.getMyContractAddressByNetwork(network), network, erc20address);
       

    }

    public  async approveMeToSpendErc20(network: string, erc20address: string): Promise<void> {
        if (network === 'BSC') {
            return await this.wallet.approveSpendErc20(environment.ukraineMintBsc, network, erc20address);
        }
        // ADDITIONAL NETOWKRS GO HERE
        //else if (network === 'BSC') {
        //   return await this.wallet.checkApprovalToSpendErc20(environment.ukraineMintBsc, network, erc20address);
        //   }
        
    }

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // PUBLIC USER FUNCTIONS // 
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // returns offerId
    public   async mintNft(
        receivingWallet: string,
        nftName: string,
        donationAmount: number | null // Make sure you use convert human to => (BIGNUMBER) 18 0s

    ): Promise<string> {



        let network = await this.getNetwork();
        return await (await this.getUkraineMintContract(false, network)).methods
            .MintNft(
                receivingWallet,
                nftName,
                donationAmount)
            .send({ from: await this.getAccount() });
    }


    public async addNFT(
        nftName: string,
        nftContractAddress: string,
        nftImage: string,
        phygital: string,
        tokenURI_metadata: string,
        minimumDonation: string, // make sure convert Human to Bignumber (18 0s)
        donationCurrency: string,
        closed: string

    ): Promise<any> {

        let network = await this.getNetwork();
        return await (await this.getUkraineMintContract(false, network)).methods
            .addNFT(nftName,
                nftContractAddress,
                nftImage,
                phygital,
                tokenURI_metadata,
                minimumDonation,
                donationCurrency,
                closed)
            .send({ from: await this.getAccount() });
    }


    public  async closeNft(nftName: string, closeNft: boolean): Promise<any> {

        let network = await this.getNetwork();
        return await (await this.getUkraineMintContract(false, network)).methods
            .closeNft(nftName, closeNft)
            .send({ from: await this.getAccount() });
    }


    public async getTotalNfts(): Promise<number>{
        let network = await this.getNetwork();
        return await (await this.getUkraineMintContract(false, network)).methods
            .getTotalNfts()
            .call();

    }

    async getDonationCurrencyAddressByNftName(nftName: string, account?: string): Promise<string> {
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
        return await (await this.getUkraineMintContract(true, network)).methods
            .donationCurrencyByNftName(nftName)
            .call();
    }



    async getMinimumDonationByNftName(nftName: string, account?: string): Promise<string> {
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
        return await (await this.getUkraineMintContract(true, network)).methods
            .minimumDonationByNftName(nftName)
            .call();
    }

    async checkIfMintingClosedByNftName(nftName: string, account?: string): Promise<boolean>  {
      
        let network = await this.getNetwork();
        return await (await this.getUkraineMintContract(true, network)).methods
            .mintingClosedByNftName(nftName)
            .call();
    }

    async getnftImageByNftName(nftName: string, account?: string): Promise<string> {
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
        return await (await this.getUkraineMintContract(true, network)).methods
            .nftImageByNftName(nftName)
            .call();
    }

    async getNftPhygitalByNftName(nftName: string, account?: string): Promise<string> {
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
        return await (await this.getUkraineMintContract(true, network)).methods
            .nftPhygitalByNftName(nftName)
            .call();
    }

    async getTokenURI_metadataByNftName(nftName: string, account?: string): Promise<string> {
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
        return await (await this.getUkraineMintContract(true, network)).methods
            .tokenURI_metadataByNftName(nftName)
            .call();
    }



    async getNftNameByIndex(index: number, account?: string): Promise<string> {
        // let from;
        // if (account) {
        //     from = account;
        // } else {
        //     from = await this.getAccount();
        // }
        // if (!from) {
        //     return "";
        // }
        console.log("UkraineMintGetNFT running");
        let network = await this.getNetwork();
        var s = await (await this.getUkraineMintContract(true, network)).methods
            .nftNames(index)
            .call();
        console.log("UkraineMintGetNFT", s);
        return s;
    }

    async getMintFromAddressByNftName(nftName: string, account?: string): Promise<string> {
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
        return await (await this.getUkraineMintContract(true, network)).methods
            .mintFromAddressByNftName(nftName)
            .call();
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
        console.log("ADMIN", network, from);
        return await (await this.getUkraineMintContract(true, network)).methods
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


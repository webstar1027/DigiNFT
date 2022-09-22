import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { WalletService } from 'src/app/services/wallet.service';
import { MoralisService } from 'src/app/services/moralis.service';
import { UkraineMintService } from 'src/app/services/ukrainemint.service';
import { environment } from 'src/environments/environment';
import { CountdownConfig, CountdownFormatFn } from 'ngx-countdown';
import { ActivatedRoute, Router } from '@angular/router';
import { CoinListService } from 'src/app/services/coinlist.service';
import { NftService } from 'src/app/services/nft.service';
import { add, boolean, e, Help, re } from 'mathjs';
import { NgTypeToSearchTemplateDirective } from '@ng-select/ng-select/lib/ng-templates.directive';
import { VerifiedWalletsService } from 'src/app/services/verified-wallets.service';
import { threadId } from 'worker_threads';
import { HelpersService } from 'src/app/services/helpers.service';
import { mintNft } from 'src/app/types/mintNft.type';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { ERC20Currency } from 'src/app/types/ERC20currency.type';



@Component({
  selector: 'app-ukraine',
  templateUrl: './ukraine.component.html',
  styleUrls: ['./ukraine.component.scss'],
 
})
export class UkraineComponent {
 
  showSwitchToBSC;
  @Input() config: any = {};
  preData: any = {};
  loading: boolean = true;


  
  ukraineAddress = environment.ukraineMintBsc;
  mintForm: FormGroup;
  amIAdmin: boolean;
  walletAddress: string;
  supportedNetworks: string[];
  availableNFTNames: string[] = [];
  nfts: mintNft[] = [];
  arrNftMetadata: string [] = [];
  nftApprovedMintSpend: {[key: string]: boolean} = {};
  
  arrNftClosedStatus: boolean[] = [];
  donationAmount = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private fb: FormBuilder,
    
    private readonly ukraine: UkraineMintService,
    
    private readonly moralis: MoralisService,
    private readonly wallet: WalletService,
    private readonly coinListService: CoinListService,
    private readonly nftService: NftService,
    private readonly verifiedWallets: VerifiedWalletsService,
    private readonly helper: HelpersService,
    private readonly httpService: HttpClient,
  ) { }

  ngOnInit(): void {

   
   
    /* this.config = {
      stopTime: new Date(this.data.auctionOrSaleData.endDate * 1000).getTime(),
      format: 'DDd HHh mm:ss',
      formatDate: this.formatDate,
    }; */

    this.route.params.subscribe((queryParams) => {
      this.preData = {
        network: queryParams.network,
      }
    });
    this.loadNetwork();

    this.loadData();
    this.setAccount().then((res) => {
    });


    // this.mintForm = this.fb.group({
    // //  attributes: this.fb.array([this.addNFT()], Validators.required),
    // });

  }

  async loadNetwork(): Promise<void> {

    this.supportedNetworks = this.ukraine.suportedNetworks;
    var currentNetwork = await this.wallet.getNetwork();
    if (!this.supportedNetworks.includes(currentNetwork)) {
      console.log("Please Switch Network to a supporting Network", this.supportedNetworks);
    }
    if (!this.supportedNetworks.includes(this.preData.network)) {
      console.log("Please Switch Network to ", this.preData.network);
    }
    console.log("Running on", currentNetwork, "network");


  }

  async loadData(): Promise<void> {

    this.loading = true;
    try {
      this.amIAdmin =  await this.ukraine.isAdmin();
      console.log("Am I Admn?", this.amIAdmin);
    } catch (error) {
      console.log("Load Admin", error);
    }    

    await this.loadAvailableNfts();

   this.loading = false;

  };

  async loadAvailableNfts() {


    // GET ALL AVAILABLE NAMES
    for (var i = 0; i < await this.ukraine.getTotalNfts(); i++) {

      try {
        this.availableNFTNames[i] = await this.ukraine.getNftNameByIndex(i);
        console.log("Got NFT", this.availableNFTNames[i]);
      } catch (error) {
            
        console.log("error", error);
       break;
      }

    }

      console.log("Receieved", this.availableNFTNames.length, "NFT Names");
      for(var i = 0; i < this.availableNFTNames.length; i++){

        
        var _nft: mintNft = {
          nft_name: this.availableNFTNames[i]
        };

        console.log("Starting Processing NFT", i+1, "of" ,this.availableNFTNames.length, _nft);
        
        _nft.network = this.preData.network;
        _nft.metadataJsonUri = await this.ukraine.getTokenURI_metadataByNftName(_nft.nft_name)
        this.httpService.get(_nft.metadataJsonUri).subscribe(
          data => {
             _nft.metadata = data as string [];	 
            _nft.image = _nft.metadata["image"];
           if(_nft.metadata["Physically Backed"]) { _nft.physical = _nft.metadata["Physically Backed"]; }
           if(_nft.metadata["description"]) {_nft.description = _nft.metadata["description"];}
           
          },  
          (err: HttpErrorResponse) => {
            console.log ("EXTERNAL JSON ERROR", err.message);
          }
        );
     
        console.log("Processing NFT", i+1, "of" ,this.availableNFTNames.length, _nft);
        
        await this.processDonationInfo(_nft);
        
        if(_nft.mintCurrency != "0x0000000000000000000000000000000000000000"){
         
        this.nftApprovedMintSpend[_nft.nft_name] = await this.checkIfSpendCurrencyIsApproved(_nft.mintCurrency, _nft.minMintPrice * 1000)
        }
        console.log("Approved To Spend", this.nftApprovedMintSpend[_nft.nft_name] );
        this.arrNftClosedStatus[i] = await this.ukraine.checkIfMintingClosedByNftName(_nft.nft_name);
        
      console.log("Loaded NFT", i+1, "of" ,this.availableNFTNames.length, _nft );

        this.nfts[i] = _nft;
      }

     


    // CREATE NFT OBJECT FROM EACH AVAILABLE NFT NAME


  }

  async mint(_nft: mintNft){

    console.log("Minting", _nft, "donation:", this.donationAmount);
    await this.ukraine.mintNft(await this.wallet.getAccount(), _nft.nft_name, this.donationAmount);

  }


  async setAccount() {
    this.walletAddress = await this.wallet.getAccount();
  }

 async processDonationInfo(_nft:mintNft){

  _nft.minMintPrice = +await this.minDonationByNftName(_nft.nft_name);
  _nft.mintCurrency = await this.ukraine.getDonationCurrencyAddressByNftName(_nft.nft_name);
  _nft.mintCurrencyERC20 = await this.coinListService.getCoinDetails(_nft.mintCurrency, this.preData.network);
  

  console.log("Donation Currency", _nft.mintCurrency);
  ;
 }




  async minDonationByNftName(NFTname: string) {
    try {
      const price = await this.ukraine.getMinimumDonationByNftName(NFTname);
      console.log('Min Donation:', price);
      return price;
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('Min Donation', e);
    }
  }

  async AdminSetNftCloseStatusByNftName(nftName: string, newCloseStatus: boolean) {
    try {
      const closeNft = await this.ukraine.closeNft(nftName, newCloseStatus);
      console.log('closeNft:', closeNft);
    
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('closeNft:', e);
    }
  }

  
 //#######################
 // ECR20 ALLOWANCES

  async checkIfSpendCurrencyIsApproved(currency: string, minAmount: number): Promise <boolean> {
    var approved: boolean = false;
    try {

      if( await this.ukraine.HowMuchAmIApprovedToSpendErc20(this.preData.network, currency) >= minAmount){
        approved = true;
      }
      
    } catch (error) {
      console.log("CheckApprove Error", error)
      approved = false;

    }
    

    return approved;
   

  }

  async approveCurrency(currency: string): Promise<void> {

   
    try {
      await this.ukraine.approveMeToSpendErc20(
        
        this.preData.network,
        currency
      );
    } catch (e) {
      console.log(e);
    }
   
  }





 

 }

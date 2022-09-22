import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { WalletService } from 'src/app/services/wallet.service';
import { MoralisService } from 'src/app/services/moralis.service';
import { DigiWaxService } from 'src/app/services/digiwax.service';
import { environment } from 'src/environments/environment';
import { CountdownConfig, CountdownFormatFn } from 'ngx-countdown';
import { ActivatedRoute, Router } from '@angular/router';
import { DigiWax } from './digiwax.type';
import { CoinListService } from 'src/app/services/coinlist.service';
import { NftService } from 'src/app/services/nft.service';
import { add, e, Help } from 'mathjs';
import { NgTypeToSearchTemplateDirective } from '@ng-select/ng-select/lib/ng-templates.directive';
import { VerifiedWalletsService} from 'src/app/services/verified-wallets.service';
import { threadId } from 'worker_threads';
import { HelpersService } from 'src/app/services/helpers.service';

@Component({
  selector: 'app-digiwax',
  templateUrl: './digiwax.component.html',
  styleUrls: ['./digiwax.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => active', [
        style({ opacity: 0 }),
        animate(10000, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class DigiWaxComponent {
  showSwitchToMatic;
  @Input() config: any = {};
  preData: any = {};
  digiWaxAddress = environment.digiWaxAddressMatic;
  
  digiwaxBoxes: DigiWax[] = [ {
    boxName: "DigiDropWave1",     
    generalSubOpen: new Date("2022-03-11 11:00:00 GMT+0500"),
    keySubOpen: new Date("2022-03-11 11:00:00 GMT+0500"),
    keyAddress: environment.nftKeysAddressMatic,
    //keyAddress:  "0x2050ebd262Db421De662607A05be26930Edbb8C8",
    publicComment: "DigiDrop Wave 1 contains 99 Pokemon Cards and 1 Steve Aoki Watch",
    imageURL:"../../assets/images/digiwax/digicubepouch1.jpg"

  },{
  boxName: "PushPouch1",     
  generalSubOpen: new Date("2022-02-18 11:00:00 GMT+0500"),
  keySubOpen: new Date("2022-02-18 11:00:00 GMT+0500"),
  keyAddress: environment.nftKeysAddressMatic,
  publicComment: "Push Pouch contains an assortment of DigiCubes including a new P Digicube - EPNS PUSH Edition",
  imageURL:"../../assets/images/digiwax/digicubepouch1.jpg"
  }

  ,{
    boxName: "makeup1",     
    generalSubOpen: new Date("2025-02-18 11:00:00 GMT+0500"),
    keySubOpen: new Date("2022-03-09 11:00:00 GMT+0500"),
    keyAddress: environment.nftKeysAddressMatic,
    publicComment: "Private make-up pouch for mobile users. Individual Key access only",
    imageURL:"../../assets/images/digiwax/digicubepouch1.jpg"
    }
    ,{
      boxName: "teamtest2",     
      generalSubOpen: new Date("2025-03-15 11:00:00 GMT+0500"),
      keySubOpen: new Date("2022-03-16 11:00:00 GMT+0500"),
      keyAddress: environment.nftKeysAddressMatic,
      publicComment: "Private wax for internal team test",
      imageURL:"../../assets/images/digiwax/digicubepouch1.jpg"
      },
]
 

  enterDigiWaxForm: FormGroup;
  boxCreatorAddress;
  generalSubmission = false;
  walletAddress;
  isKeySubOpen: boolean;
  keyAddress;

  currencyAllowedLimit;
  currencyAllowed: boolean;

  iSubscribedGeneral:boolean;

  isGenSubOpen: boolean;
  requestId;
  userKeys = [];
  boxOwner;
  boxOwnerDisplay;
  iAmOwner = false;
  boxName = "";
  activeBox: DigiWax;
  entryFee;
  entryFee_human;
  entryFeeAddress;
  entryFeeAddressTokenName;
  totalSpots = 0;
  totalWallets =0;
  remainingSpots = 0;
  mySpots = 0;
  genSubOpenLocalTime;
  keySubOpenLocalTime;
  availableKeys = 0;
  keyAddresses = [];
  keyTokenIds = [];
  keyAddressesAllowed = [];
  keyTokenIdsAllowed = [];
  userKeyAddresses = [];
  userKeyTokenIds = [];
  boxNfts = [];
  oracleSpoke = false;
  loadingKeys = true;
  loadingSpots = true;
  loadedBoxNftsQty = 0;
  loadBoxNftsAtATime = 10; 





  // changeDetection: ChangeDetectionStrategy.OnPush
  CountdownTimeUnits: Array<[string, number]> = [
    ['Y', 1000 * 60 * 60 * 24 * 365], // years
    ['M', 1000 * 60 * 60 * 24 * 30], // months
    ['D', 1000 * 60 * 60 * 24], // days
    ['H', 1000 * 60 * 60], // hours
    ['m', 1000 * 60], // minutes
    ['s', 1000], // seconds
    ['S', 1], // million seconds
  ];
  formatDate?: CountdownFormatFn = ({ date, formatStr, timezone }) => {
    let duration = Number(date || 0);

    return this.CountdownTimeUnits.reduce((current, [name, unit]) => {
      if (current.indexOf(name) !== -1) {
        const v = Math.floor(duration / unit);
        duration -= v * unit;
        return current.replace(new RegExp(`${name}+`, 'g'), (match: string) => {
          return v.toString().padStart(match.length, '0');
        });
      }
      return current;
    }, formatStr);
  };

  constructor(
    private readonly route: ActivatedRoute,
    private fb: FormBuilder,
    private readonly digiWax: DigiWaxService,
    private readonly moralis: MoralisService,
    private readonly wallet: WalletService,
    private readonly coinList: CoinListService,
    private readonly nftService: NftService,
    private readonly verifiedWallets: VerifiedWalletsService,
    private readonly helper: HelpersService,
  ) {}

  ngOnInit(): void {
    /* this.config = {
      stopTime: new Date(this.data.auctionOrSaleData.endDate * 1000).getTime(),
      format: 'DDd HHh mm:ss',
      formatDate: this.formatDate,
    }; */

    this.route.params.subscribe((queryParams) => {
      this.preData = {
        network: queryParams.network,
        boxName: queryParams.boxName        
      }
    });
    var foundBox = this.findBox();
    if(!foundBox) { return;}
    this.setAccount().then((res) => {
      
      this.loadData();     
      
      this.digikeySubscriptionOpenByBoxName();
      this.generalSubscriptionOpenByBoxName();
     
      
    
   
      this.getEntryFee();
      this.getTotalSpotsAndWallets();

    
     
      // this.getRequestId();
      this.getBoxOwner();
      // this.WalletSubscribed();
      // this.accessPriceContractAddressByBoxName();
      // this.boxSealedByRequestId();
      // this.breakWaxBox();
      this.oracleSpokeByBoxName();
      // this.updateSubscriptionsByBox();
      // this.accessFeePercentage();
      // this.accessPriceByBoxName();
      
    });
    this.enterDigiWaxForm = this.fb.group({
      attributes: this.fb.array([this.addNFT()], Validators.required),
    });
    console.log("Digiwax BoxName: " + this.preData.boxName);
  }

  async loadData(): Promise<void> {

   
    await this.digiKeytokensArrayByBoxName();
   
      
  };

  async getCardDetails(NFTs) {
    let array: any = [];
    NFTs.forEach(async (nft) => {
      array.push(
        await this.moralis.getNftDataFromMoralis(
          nft.token_address,
          nft.token_id,
          'MATIC'
        )
      );
    });
    this.userKeys = array;
  }

  // async checkIfWalletHasKey() {
  //   try {

  //     for (let i = 0; i < this.keyAddressesAllowed.length; i ++) {
  //       const NFTs: any = await this.moralis.getNFTsForContract(
  //         'MATIC',
  //         this.walletAddress,
  //         this.keyAddressesAllowed[i]
  //       );
        
  //       if(NFTs.token_address == this.keyAddressesAllowed[i])
  //       this.userKeys = NFTs.result;
  //       console.log('checkIfWalletHasKey:', this.userKeys);
  //       this.getCardDetails(NFTs.result);
  //     }
      

      
  //   } catch (e) {
  //     // TRIGGER POP UP TO SHOW ERROR FROM HERE
  //     console.log('checkIfWalletHasKey:', e);
  //   }
  // }


  async setAccount() {
    this.walletAddress = await this.wallet.getAccount();
  }

  async getRequestId() {
    try {
      this.requestId = await this.digiWax.getRequestIdByBoxName(this.boxName);
      console.log('getRequestId:', this.requestId);
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('getRequestId:', e);
    }
  }

  async loadKeysSimple(){
    try {
      
      var _nfts = await (this.moralis.getNFTsForContract(this.preData.network, this.walletAddress, this.keyAddress));
      for (let i = 0; i < _nfts.result.length; i++ ){
      
        let allowed = await this.digiWax.digiKeytokenAllowedByBoxName(this.boxName, this.keyAddress, parseInt(_nfts.result[i].token_id));
        console.log('LKS:', _nfts.result[i]);
        if (allowed){
          const _nft: any = await this.moralis.getNftDataFromMoralis(
            this.keyAddress,
            _nfts.result[i].token_id,
            this.preData.network
          );
          this.userKeys.push(_nft);
          console.log('LKS Allowed:',_nft);
         
        }
      }

      this.loadingKeys = false;

    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('Load Keys Simple Error:', e);
    }

  }

  
  async digiKeytokensArrayByBoxName() {
    this.loadingKeys = true;
   if(this.keyAddress && this.keyAddress.length > 0){
     console.log("simple key load");
    this.loadKeysSimple();
    return;

   }
   console.log("complex keys", this.keyAddress, this.keyAddress.length);

    try {
      

      this.availableKeys = await this.digiWax.getTotalKeysByBoxName(this.boxName);
      for (let i = 0; i < this.availableKeys; i++ ){
        let address = await this.digiWax.digiKeyAddressByBoxName(this.boxName, i);
        let tokenId = await this.digiWax.digiKeytokenByBoxName(this.boxName, i);
        let allowed = await this.digiWax.digiKeytokenAllowedByBoxName(this.boxName, address, tokenId);
        this.keyAddresses.push(address);
        this.keyTokenIds.push(tokenId);
        

        if(allowed){
          this.keyAddressesAllowed.push(address);
          this.keyTokenIdsAllowed.push(tokenId);
          let keyOwner = await this.nftService.externalOwner(address, tokenId);
          // console.log("digikey / owner", tokenId, keyOwner);
          if(keyOwner.toLocaleUpperCase() == this.walletAddress.toLocaleUpperCase()) {
            const _nft: any = await this.moralis.getNftDataFromMoralis(
              address,
              tokenId,
              this.preData.network
            
            );
            this.userKeyAddresses.push(address);
            this.userKeyTokenIds.push(tokenId);
            this.userKeys.push(_nft);
            console.log("Moralis NFT Result", _nft);
          }
        }
      }

      

      this.loadingKeys = false;
      
      console.log('Keys:', this.keyAddresses, this.keyTokenIds);
      console.log("Allowed Keys", this.keyAddressesAllowed, this.keyTokenIdsAllowed);
      console.log("User Keys", this.userKeyAddresses, this.userKeyTokenIds);
    
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('digiKeytokensArrayByBoxName:', e);
    }
  }

  async accessPriceByBoxName() {
    try {
      const price = await this.digiWax.accessPriceByBoxName(this.boxName);
      console.log('PRICE BY BOX NAME:', price);
      return price;
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('PRICE BY BOX NAME:', e);
    }
  }

  async breakWaxBox() {
    try {
      const breakWaxBox = await this.digiWax.breakWaxBox(this.boxName);
      console.log('breakWaxBox:', breakWaxBox);
      return breakWaxBox;
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('breakWaxBox:', e);
    }
  }

  async subscribeWalletToBoxByName() {
    try {
      const result = await this.digiWax.subscribeWalletToBoxByName(
        this.preData.network,
        this.boxName,
        this.walletAddress
      );
      console.log('subscribeWalletToBoxByName:', result);
      this.getTotalSpotsAndWallets();
      return result;
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('subscribeWalletToBoxByName:', e);
    }
  }
  async subscribeWalletToBoxByRequestIdUsingKey(keyAddress: string, keyTokenId: number) {
    try {
      const result = await this.digiWax.subscribeWalletToBoxUsingKey(
        this.preData.network,        
        this.boxName,
        this.walletAddress,
        keyAddress,
        keyTokenId
      );
      console.log('subscribeWalletToBoxByRequestIdUsingKey:', result);
      this.getTotalSpotsAndWallets();
      this.digiKeytokensArrayByBoxName();
      return result;
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('subscribeWalletToBoxByRequestIdUsingKey:', e);
    }
  }

  async getBoxOwner() {
    try {
      this.boxOwner = await this.digiWax.getBoxOwner(this.boxName);
      var verified = await this.verifiedWallets.getVerifiedName(this.boxOwner);
      if(verified) {
        this.boxOwnerDisplay = verified;
      }
      else{ this.boxOwnerDisplay = this.helper.truncate(this.boxOwner, 15, '...'); }
      console.log('GET BOX OWNER:', this.boxOwner);
      if(this.boxOwner.toLocaleUpperCase() == this.walletAddress.toLocaleUpperCase()){
        this.iAmOwner = true;
      }
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('GET BOX OWNER:', e);
    }
  }

  async accessPriceContractAddressByBoxName() {
    try {
      const contractAddress =
        await this.digiWax.accessPriceContractAddressByBoxName(this.boxName);
      console.log('accessPriceContractAddressByBoxName:', contractAddress);
      return contractAddress;
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('accessPriceContractAddressByBoxName:', e);
    }
  }

  async WalletSubscribed() {
    try {
      const participantWallets = await this.digiWax.WalletSubscribed(
        this.boxName,
        this.walletAddress
      );
      console.log('WalletSubscribed:', participantWallets);
      return participantWallets;
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('WalletSubscribed:', e);
    }
  }

  async boxSealedByRequestId() {
    try {
      const boxSealed = await this.digiWax.boxSealedByRequestId(this.requestId);
      console.log('boxSealedByRequestId:', boxSealed);
      return boxSealed;
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('boxSealedByRequestId:', e);
    }
  }

  async updateSubscriptionsByBox(openGen: boolean, openKey: boolean) {
    try {
      const result = await this.digiWax.updateSubscriptionsByBox(
        this.preData.network,
        this.boxName,
        openGen,
        openKey
      );
      console.log('updateSubscriptionsByBox:', result);
      this.digikeySubscriptionOpenByBoxName();
      this.generalSubscriptionOpenByBoxName();

     
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('updateSubscriptionsByBox:', e);
    }
  }

  // Check if general subscription is open
  async generalSubscriptionOpenByBoxName() {
    try {
      const isGenSubOpen =
        await this.digiWax.generalSubscriptionOpen_by_boxName_map(this.boxName);
      console.log('generalSubscriptionOpenByBoxName:', isGenSubOpen);
      this.isGenSubOpen = isGenSubOpen;
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('generalSubscriptionOpenByBoxName:', e);
    }
  }

  async digikeySubscriptionOpenByBoxName() {
    if(this.boxName == "") return;
    try {
      const isKeySubOPen = await this.digiWax.digikeySubscriptionOpenByBoxName(
        this.boxName
      );
      console.log('digikeySubscriptionOpenByBoxName:', isKeySubOPen);
      this.isKeySubOpen = isKeySubOPen;
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      
      console.log('digikeySubscriptionOpenByBoxName: box name:' + this.boxName + " : ", e);
    }
  }

  async oracleSpokeByBoxName() {
    try {
      const oracleSpoke = await this.digiWax.oracleSpokeByBoxName(this.boxName);
      console.log('oracleSpokeByBoxName:', oracleSpoke);
      this.oracleSpoke = oracleSpoke;
      return oracleSpoke;
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('oracleSpokeByBoxName:', e);
    }
  }

  async accessFeePercentage() {
    try {
      const feePercentage = await this.digiWax.accessFeePercentage();
      console.log('accessFeePercentage:', feePercentage + '%');
      return feePercentage;
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('accessFeePercentage:', e);
    }
  }

  addNFT() {
    // something
  }

  submitEntry() {
    // HERE
  }



  async getEntryFee() {
    try {
      this.entryFee = await this.digiWax.accessPriceByBoxName(this.boxName);
      this.entryFeeAddress = await this.digiWax.accessPriceContractAddressByBoxName(this.boxName);
      this.entryFeeAddressTokenName = this.coinList.getCoinDetails(this.entryFeeAddress, this.preData.network).displayName;
      this.entryFee_human = this.entryFee / 10**18;       
      console.log('entry fee:', this.entryFee, this.entryFeeAddress );
      this.checkAllowed();
      
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('entry fee:', e);
    }
  }

  


  async getTotalSpotsAndWallets(){
    this.loadingSpots = true;
    try {
  
      this.totalSpots = await this.digiWax.getTotalSpotsByBoxName(this.boxName);
      
    
      this.totalWallets = await this.digiWax.getTotalWalletsByBoxName(this.boxName);
      this.remainingSpots = this.totalSpots - this.totalWallets;
      this.iSubscribedGeneral = await this.digiWax.getWalletSubscribedByBox(this.boxName, this.walletAddress);
      
      this.mySpots = 0;
      for (let i = 0; i < this.totalWallets; i++){
        
        let _wallet = await this.digiWax.getParticipantWalletsByBoxName(this.boxName, i);
        if (_wallet == this.walletAddress) {
          this.mySpots +=1;
        }

      }
      console.log('totalSpots:', this.totalSpots);
      console.log("Box Nfts", this.boxNfts);
      this.loadingSpots = false;
    
      this.loadBoxNfts();
      
    } catch (e) {
      // TRIGGER POP UP TO SHOW ERROR FROM HERE
      console.log('totalSpots:', e);
    }

  }

  async loadBoxNfts() {

    if(this.loadingSpots) {return;}
    try{
    var stopIndex = Math.min(this.loadedBoxNftsQty + this.loadBoxNftsAtATime,  this.totalSpots);
    console.log('Load Box Nfts Stop Index Start:', stopIndex);
    if (stopIndex <= this.loadedBoxNftsQty) {
      console.log("All Box NFTs are Loaded");
      return;

    }
    for (let i = this.loadedBoxNftsQty;  i < stopIndex;  i++) 
    {
      let address = (await this.digiWax.getBoxNFTAddress(this.boxName, i));
      let tokenId = (await this.digiWax.getBoxNFTtokenId(this.boxName, i)).toString();
      const _nft: any = await this.moralis.getNftDataFromMoralis(
        address,
        tokenId,
        this.preData.network)
        if(_nft){
          this.boxNfts.push(_nft);
        }
        this.loadedBoxNftsQty +=1;
   
    }
    this.loadedBoxNftsQty = stopIndex;
    console.log('Loaded Box Nfts:', this.loadedBoxNftsQty);



  }
  catch (e){
   // TRIGGER POP UP TO SHOW ERROR FROM HERE
   console.log('loadBoxNfts Error:', e);

  }

    
    
  }


   async findBox() {
    for (let i= 0; i < this.digiwaxBoxes.length; i++)

    if(this.digiwaxBoxes[i].boxName == this.preData.boxName){

      this.boxName = this.preData.boxName;
      this.activeBox = this.digiwaxBoxes[i]; 
      this.genSubOpenLocalTime = this.convertUTCDateToLocalDate(this.activeBox.generalSubOpen).toLocaleDateString() + " " + this.convertUTCDateToLocalDate(this.activeBox.generalSubOpen).toLocaleTimeString();
      this.config = {
        stopTime: this.activeBox.generalSubOpen,
        format: 'DDd HHh mm:ss',
        formatDate: this.formatDate,   
       }; 
       this.keyAddress = this.digiwaxBoxes[i].keyAddress;
      
      console.log("DigiWax: Found Box " + this.boxName + " GenSub opens " + this.activeBox.generalSubOpen);
      return true;
     
    }

    console.log("DigiWax: Box  " + this.preData.boxName + " not found");
    return false;
  }

  async checkAllowed() {
    this.currencyAllowedLimit = await this.nftService.allowedTokenFor(environment.digiWaxAddressMatic, this.preData.network, this.entryFeeAddress);
    if(this.currencyAllowedLimit >= this.entryFee_human * 10**18) {
      this.currencyAllowed = true;
    }
    else{this.currencyAllowed = false};
  }

  async approveCurrency(): Promise<void> {
 
    let currency;
    try {
      await this.nftService.approve(
        await environment.digiWaxAddressMatic,
        this.preData.network,
        this.entryFeeAddress
      );
    } catch (e) {
      console.log(e);
    }
    this.checkAllowed();
   
  }

  

  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
}


  
}

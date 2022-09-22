import { DatePipe, Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DigiTradeService } from 'src/app/services/digitrade.service';
import { MarketplaceAndAuctionService } from 'src/app/services/marketandauction.service';
import { MathService } from 'src/app/services/math.service';
import { NftService } from 'src/app/services/nft.service';
import { OffchainService } from 'src/app/services/offchain.service';
import { MoralisService } from 'src/app/services/moralis.service';
import { VerifiedWalletsService } from 'src/app/services/verified-wallets.service';
import { WalletService } from 'src/app/services/wallet.service';
import { Network } from 'src/app/types/network.enum';
import { environment } from 'src/environments/environment';
import { HelpersService } from '../../services/helpers.service';
import { DescriptionType } from '../../types/description.type';
import { DigiTrackService } from 'src/app/services/digitrack.service';
import { digitradeOffer } from 'src/app/types/digitrade-offer.type';
import { DigiService } from 'src/app/services/digi.service';
import { max } from 'mathjs';
import { CoinListService } from 'src/app/services/coinlist.service';
import { ERC20Currency } from 'src/app/types/ERC20currency.type';


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit, OnDestroy {
  @ViewChild('burnTokenModal') burnTokenModal: ElementRef;
  @ViewChild('editDescriptionModal') editDescriptionModal: ElementRef;
  supportedNetworks: string[] = ['MATC', 'BSC']; // MANUAL VARIABLE TO CHECK AGAINST
  amIonRightNetwork: boolean;

  private getNetworkData(network: Network): { name: string; prefix: string } {
    if (network === Network.ETH) {
      return {
        name: 'ETH',
        prefix: 'https://etherscan.io/address/',
      };
    } else if (network === Network.MATIC) {
      return {
        name: 'MATIC',
        prefix: 'https://explorer-mainnet.maticvigil.com/address/',
      };
    } else if (network == Network.BSC){
      return {
        name: 'BSC',
        prefix: 'https://bscscan.com/address',
      };
    }
    
    else {
      return {
        name: 'Invalid',
        prefix: '#',
      };
    }
  }


  data: any = {};
  preData: any = {};
  attributes;
  id;
  network;
  auctionOrSaleData;
  symbol = environment.stableCoinSymbol;
  name = '...';
  description: DescriptionType;
  nftData;
  showAlertMessage: boolean = false;
  error_message: string;
  winner;
  customBorder;
  winnerIsVerified;
  endDate = '...';
  burnDate;
  physical;
  auctionId;
  auctionOwner;
  saleId;
  fee;
  highestBid = null;
  address: string;
  fullDescription;
  inputDescription;
  inputPublisher;
  inputEdition;
  inputYear;
  inputGraded;
  inputPopulation;
  digiAddressMatic = environment.maticCoinContractAddresses.digiAddressMatic;
  usdcMaticAddress = environment.maticCoinContractAddresses.usdcAddressMatic;
  usdtMaticAddress = environment.maticCoinContractAddresses.usdtAddressMatic;
  maticCoinAddress = environment.maticCoinContractAddresses.maticCoinAddress;
  linkMaticAddress = environment.maticCoinContractAddresses.linkAddressMatic;
  explorerPrefixOfOwner;
  contractAddress = '...';
  ownerAddress;
  verifiedSeller;
 
  showApproveSell;
  lowBid = true;
  explorerPrefix;
  auction = false;
  canClaimBackFromAuction = false;
  buy = false;
  price;
  priceDecimals;
  priceBuyNow;
  priceBuyNowDecimals;
  showApprovedForBuy;
  
  
  isApprovedForBuy;
  isApprovedForBid;


  allowed;
  allowedMarket;
  inputAmount;
  hasRoyalty;
  hasRoyaltyOnAuction;
  royaltyFee;
  royaltyFeeAuction;
  lastBids: { amount: string; wallet: string; created: number }[];
  showAllow = false;
  loading = false;
  loadingLastBids = false;
  loadingLastSells = false;
  showMaticApprove = true;
  isInEth = false;
  descriptionLoading = false;
  
  canSetRoyalty = false;

  nftAddress: string;
  lastSells;
  backSideImageExists = false;
  paymentCurrencyName: string;
  paymentCurrencyERC20: ERC20Currency;
  unreadableJson = false;
  bidApprovedQty;
  winnerAddress;

  phygitalStatus: string;
  isYours = false;
  isDigisafe: boolean;
  isAuction = false;
  offerModal = false;
  amountInput : any; //For DigiTrade Offer
  digiTokenBalance;
  paymentToken;

  private readonly canGoBack: boolean;

  constructor(
    private readonly route: ActivatedRoute,
    readonly router: Router,
    private readonly location: Location,
    private readonly offChain: OffchainService,
    private readonly walletService: WalletService,
    private readonly nft: NftService,
    private readonly cdr: ChangeDetectorRef,
    private readonly math: MathService,
    private readonly market: MarketplaceAndAuctionService,
    private readonly verifiedProfiles: VerifiedWalletsService,
    private readonly helpers: HelpersService,
    private readonly moralis: MoralisService,
    private readonly digitrack: DigiTrackService,
    private readonly digitrade: DigiTradeService,
    private readonly digiservice: DigiService,
    private readonly coinListService: CoinListService,
    public datepipe: DatePipe
  ) {
    this.canGoBack = !!this.router.getCurrentNavigation()?.previousNavigation;
  }

  ngOnInit(): void {
    
    this.route.params.subscribe((queryParams) => {
      this.preData = {
        id: queryParams.id,
        network: queryParams.network,
        tokenAddress: queryParams.tokenAddress,
      };

      if (
        environment.deletedNfts.indexOf(
          parseInt(this.preData.id, undefined)
        ) !== -1
      ) {
        this.router.navigate(['/']);
        return;
      }
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    if (this.highestBid) {
      clearInterval(this.highestBid);
    }
  }

  async loadData(): Promise<void> {
    console.log("Loading Data...");
    this.name = '...';
    this.digiTokenBalance = '...';
    this.description = null;
    this.physical = null;
    this.explorerPrefixOfOwner = null;
    this.contractAddress = this.preData.tokenAddress;
    this.ownerAddress = null;
    this.verifiedSeller = null;
    this.explorerPrefix = null;
    this.price = null;
    this.auction = false;
    this.buy = false;
    this.priceBuyNow = null;
    this.auctionId = null;
    this.saleId = null;
    this.lastSells = null;
    this.phygitalStatus = "Digi Authentication Pending";
    if (this.highestBid) {
      clearInterval(this.highestBid);
    }

    this.walletService.getAccount().then(res => {
      this.address = res;
    })
    .catch(err => {
      console.log(err)
    })

    
    await this.checkNetwork();
    this.currencyDropDown = await this.coinListService.getSupportedCurrencyDropDownByNetwork(this.preData.network);
   
    await this.getCardDetails();

    await this.loadSale();
    await this.loadAuction();
    
    if(this.loadDigiTrade) {
      await this.loadDigiTradeInfo();
    }
    console.log( "can claim?", this.canClaimBackFromAuction, "owner:", this.ownerAddress, this.offersMadeToMe.length);
      this.loading = false;
    console.log("Loading Data Complete");
    this.paymentToken = this.coinListService.getCoinDetails(this.auctionOrSaleData?.paymentCurrency, this.preData.network);
  }

  refreshMetaData() {
    this.moralis
      .reSyncMetadata(this.preData.tokenAddress, this.preData.id)
      .then((res) => {
        window.location.reload()
      });
  }
  async getSetDigiBalance() {
    console.log("Get Digi Token Balance ", this.preData.network, this.digiTokenBalance);
    this.digiTokenBalance = await this.digiservice.getDigiBalanceByNetwork(this.preData.network);
    console.log("Digi Token Balance ", this.preData.network, this.digiTokenBalance);
  }

// ############# DIGITRADE ################################

loadDigiTrade = false; // IF FALSE, WILL NOT LOAD
//##### DIGITRADE CONFIG #########

approvedDigiTradeToSpendDIGIforFees: boolean = false; // it costs DIGI to make and accept offers. 

paymentCurrencyDigiTrade: string; //What is the payment currency of the offer from modal
paymentCurrencyNameDigiTrade: string; // set on digitrade dropdown change

paymentCurrencyAmountDigiTrade: number // how much is offered

paymentCurrencyBalanceDigiTrade: number // how much balance of payment currency you have

approvedDigiTradeSpendCurrency: boolean = false; 

approvedAllDigiTradeNFTOffered1: boolean;

approvedAllDigiTradeNFTOffered2: boolean;

digiTradeMakeOffferFee: number;

digiTradeAcceptOfferFee: number;

offersIMade: any[] = [];
offersMadeToMe: any[] = [];


currencyDropDown = [];

async loadDigiTradeInfo(){

  console.log("Loading DigiTrade Info");
  this.getSetDigiBalance();
  
  // 1. Fees for Making Offer, Accepting Offer and ERC2 DIgi Approval
  this.digiTradeMakeOffferFee = await this.digitrade.getFeeToMakeOffer(this.preData.network);
  console.log("offer fee", this.digiTradeMakeOffferFee);
  this.digiTradeAcceptOfferFee = await this.digitrade.getFeeToAcceptOffer(this.preData.network);
  const approvedAmount = await this.digitrade.HowMuchAmIApprovedToSpendErc20(this.preData.network, this.digiservice.getDigiContractAddressByNetwork(this.preData.network));
  console.log("Approved to Spend DIGI", approvedAmount);

  if(approvedAmount > max(this.digiTradeAcceptOfferFee, this.digiTradeMakeOffferFee)){
    this.approvedDigiTradeToSpendDIGIforFees = true;
  }

  // 2. Pre-load offer currency, if existing sale use that otherwise use digi
  console.log(this.auctionOrSaleData, this.currencyDropDown, 'auction or sale');
  if(this.auctionOrSaleData && this.auctionOrSaleData.paymentCurrency) {

    this.paymentCurrencyDigiTrade = this.auctionOrSaleData.paymentCurrency;
    this.currencyDropDown.forEach((item) => {
      if (item.id === this.paymentCurrencyDigiTrade) {
        this.paymentCurrencyNameDigiTrade= item.name;
      }
    });    
  }
  else{
    this.paymentCurrencyDigiTrade = this.digiservice.getDigiContractAddressByNetwork(this.preData.network);
    this.paymentCurrencyNameDigiTrade = 'DIGI';
  }
  
  await this.getSetTradeCurencyBalance();
  
  // 3. Check if I have any offers made to me?


   await this.doIHaveTradeOffers();

  

  // 4. Check if I made an offer on this?
  
  console.log("Loading DigiTrade Info Complete");
}
async viewMyOffers(){

}

async doIHaveTradeOffers(){

  // Check if I received offers as owner
  if(this.address&& this.address == this.ownerAddress){
  console.log("Checking offers to me", this.address);
   
  var offerIds = await this.digitrade.getOfferIds_by_wallet(this.address, this.preData.network);

  var orders = [];
  try {
    for (let index = 0; index < offerIds.length; index++) {
      const element = offerIds[index];
      var order = await this.digitrade.getOfferDetails(element, this.address);
      orders.push(order);
      
    }
  } catch (error) {
    console.log(error);
  }
  
  this.offersMadeToMe = orders;
  console.log("offersMadeToMe", orders);
    
  
 // Check if I made offers on this NFT
  } else if(this.address){ 

    console.log("Check if I made offers on this NFT", this.address);
    var offerIds = await this.digitrade.getOfferIds_by_wallet(this.address, this.preData.network);

    var orders = [];
  try {
    
    for (let index = 0; index < offerIds.length; index++) {
      
      const element = offerIds[index];
      console.log(element);
      var order = await this.digitrade.getOfferDetails(element, this.address);
      orders.push(order);
      
    }
  } catch (error) {
    console.log(error);
  }
    
    console.log("offersIMade", orders);
    this.offersIMade = orders;
  }

  console.log("Loading offers Complete");
}

async getSetTradeCurencyBalance() {
  if(!this.paymentCurrencyDigiTrade || this.paymentCurrencyDigiTrade != "0x0000000000000000000000000000000000000000") {
    console.log("No payment currency", this.paymentCurrencyDigiTrade);
    
    return;
  }
  this.paymentCurrencyBalanceDigiTrade = 
    await this.walletService.getTokenBalance(
      this.paymentCurrencyDigiTrade, this.preData.network)
  console.log("Offer currency set to", this.paymentCurrencyNameDigiTrade, this.paymentCurrencyDigiTrade, "my balance", this.paymentCurrencyBalanceDigiTrade);
  
}

async processNewTradeCurrency(){
  this.getSetTradeCurencyBalance();

  if(this.paymentCurrencyDigiTrade && this.paymentCurrencyDigiTrade != "0x0000000000000000000000000000000000000000") {
    const approvedAmount = await this.digitrade.HowMuchAmIApprovedToSpendErc20(this.preData.network, this.paymentCurrencyDigiTrade);
    console.log(approvedAmount, 'approved amount');
    if(approvedAmount > 1000000000000000000000000){
      this.approvedDigiTradeSpendCurrency = true;  
    }
    else{
      this.approvedDigiTradeSpendCurrency = false;  
    }
      console.log("Spend Currency", this.paymentCurrencyDigiTrade, this.approvedDigiTradeSpendCurrency);
  }
  else{
    this.approvedDigiTradeSpendCurrency = false;
    console.log("No Default DigiTrade Spend Currency");

} 



}

currencyHandlerDigiTrade()
 {
  this.currencyDropDown.forEach((item) => {
    if (item.id === this.paymentCurrencyDigiTrade) {
      this.paymentCurrencyNameDigiTrade= item.name;
      this.paymentCurrencyDigiTrade = item.id;
    }
  });

  this.processNewTradeCurrency();
 
 
  console.log(this.paymentCurrencyDigiTrade, this.paymentCurrencyNameDigiTrade)
}


async approveDigiForDigiTrade(){

 await this.walletService.approveSpendErc20(this.digitrade.getMyContractAddressByNetwork(this.preData.network), this.preData.network, this.digiservice.getDigiContractAddressByNetwork(this.preData.network));
}

async approveTradeCurrencyForDigiTrade(){

  await this.walletService.approveSpendErc20(this.digitrade.getMyContractAddressByNetwork(this.preData.network), this.preData.network, this.paymentCurrencyDigiTrade);
 }

  
  async checkDigiTradeCurrencyApproval() {
    let qty = await this.nft.allowedTokenFor(
      environment.digiTradeAddressMatic,
      this.preData.network,
      environment.maticCoinContractAddresses.usdtAddressMatic
    );
    if (qty !== 0) {
      return true;
    } else {
      return false;
    }
  }
  async checkDigiTradeNFTApproval() {
    return await this.nft.isApprovedForAll(
      this.address,
      environment.digiTradeAddressMatic,
      this.preData.network,
      this.preData.tokenAddress
    );
  }


  async makeOffer() {
    
      if(!this.approvedDigiTradeSpendCurrency || !this.approvedDigiTradeToSpendDIGIforFees ) {
        console.log("Approve contract for spend first");
      }

      if(!this.amountInput || this.amountInput <=0 ){
        console.log("Amount must be > 0");
        return;
      }
      try {
      var offer: digitradeOffer = {wallets: [this.address, this.ownerAddress]};
      offer.erc20QtyRequested = "0";
      offer.addresses = ["", "", this.paymentCurrencyDigiTrade, this.preData.tokenAddress, "",""];
      offer.nftTokenIds= ["0", "0", this.preData.id, "0"];
      offer.erc20QtyOffered = this.math.toBlockchainValue(this.amountInput);
    



      
        
          await this.digitrade.makeOffer(offer)
          
        } catch(e) {
          console.log(e)
        }
      

     
   

    let el = document.querySelector("#offerModal button.close")  as HTMLInputElement;
    el.click();
  }
  closeErrorBanner() {
    // CLose banner here
    this.showAlertMessage = false;
  }

  public toFixedNoRounding(n:any, d: any) {
    const reg = new RegExp(`^-?\\d+(?:\\.\\d{0,${n}})?`, 'g')
    const a = d.toString().match(reg)[0];
    const dot = a.indexOf('.');
  
    if (dot === -1) {
      return a + '.' + '0'.repeat(n);
    }
  
    const b = n - (a.length - dot) + 1;
  
    return b > 0 ? (a + '0'.repeat(b)) : a;
  }
  connectEthereum() {
    if (environment.testnet) {
      this.walletService.getProvider().request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: '0x5',
          },
        ],
      });
    } else {
      this.walletService.getProvider().request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: '0x1',
          },
        ],
      });
    }
  }

  async getRoyalty(owner: string, network: string): Promise<void> {
    if (!owner) {
      owner = this.ownerAddress;
    }
    try {
      console.log("Getting Royalty");
      this.hasRoyalty = await this.market.hasRoyalty(
        this.preData.tokenAddress,
        this.preData.id,
        this.preData.network,
        this.data.owner
      );
    } catch (e) {
      console.log('HAS ROYALTY ERR:', e);
    }
    console.log(" Royalty", this.hasRoyalty);
    if (this.hasRoyalty) {
      this.market
        .getRoyaltyFee(
          this.preData.id,
          this.preData.network,
          this.preData.tokenAddress
        )
        .then((fee) => {
          this.royaltyFee = fee / 100;
        });
        this.canSetRoyalty = false;
    }

    else if(this.address != null && this.address == this.ownerAddress){
   
   
    }

    this.canSetRoyalty = await  this.market.canOwnerSetRoyalty(this.preData.network, this.preData.tokenAddress, this.preData.id);
    
    console.log("Can Set Royalty", this.canSetRoyalty);
  }

  async enableRoyalty(): Promise<void> {
    this.loading = true;
    this.fee =
      parseInt(prompt('Input your desired fee %', '5'), undefined) * 100;
    try {
      await this.market.applyRoyalty(
        this.preData.id,
        this.address,
        this.fee,
        this.preData.network,
        this.preData.tokenAddress
      );
    } catch (e) {
      this.showAlertMessage = true;
      this.error_message = e.message;
      console.error(e);
    }
    this.loadData();
    this.loading = false;
  }



  /* async checkApproveMatic(): Promise<void> {
    this.showMaticApprove = !(await this.nft.isApprovedForAll(
      await this.walletService.getAccount(),
      environment.maticPredicate,
      this.preData.network,
      this.preData.tokenAddress
    ));
    this.cdr.detectChanges();
  } */

  // async checkApprovedForBuy(): Promise<void> {
    
  //     this.isApprovedForBuy = await this.nft.isApprovedForAll(
  //       await this.walletService.getAccount(),
  //       environment.marketplaceAddressMatic,
  //       this.preData.network,
  //       this.preData.tokenAddress
  //     )
  //     console.log('isApprovedForBuy:', this.isApprovedForBuy);
  //     this.cdr.detectChanges();
    
  // }

  async checkApprovedForBid(): Promise<void> {
    if (this.auction && this.auctionOrSaleData) {
      console.log("Auction Data: ", this.auctionOrSaleData);
     this.bidApprovedQty = await this.market.HowMuchAmIApprovedToSpendErc20(
      this.preData.network,
       this.auctionOrSaleData.paymentCurrency
      );

      if(!this.auctionOrSaleData.highestBid){
        this.auctionOrSaleData.highestBid = 0;
      }
      if( this.bidApprovedQty  >= (this.auctionOrSaleData.highestBid + 1000000000000000000 )* 10){
      this.isApprovedForBid = true;

      }
      else{
        this.isApprovedForBid = false;
      }
      console.log('isApprovedForBid:', this.bidApprovedQty, "highest bid ", this.auctionOrSaleData.highestBid, this.isApprovedForBid);
      this.cdr.detectChanges();
    }
  }

  truncate(fullStr, strLen, separator) {
    if (fullStr.length <= strLen) return fullStr;

    separator = separator || '...';

    var sepLen = separator.length,
      charsToShow = strLen - sepLen,
      frontChars = Math.ceil(charsToShow / 2),
      backChars = Math.floor(charsToShow / 2);

    return (
      fullStr.substr(0, frontChars) +
      separator +
      fullStr.substr(fullStr.length - backChars)
    );
  }

  /* roughScale(x, base) {
    const parsed = parseInt(Number(x), base);
    if (isNaN(parsed)) {
      return 0;
    }
    return parsed * 100;
  } */

  async loadLastSells(): Promise<void> {
    this.loadingLastSells = true;
    let lastSells;
    try {
      lastSells = await this.moralis.getWalletTokenIdTransfers(
        this.preData.tokenAddress,
        this.preData.id,
        this.preData.network
      );
      lastSells = lastSells.result;
      console.log(lastSells);
      /* lastSells.forEach(async (element) => {
        const t = await this.moralis.getTransactionByHash(
          element.transaction_hash
        );
        const logs = t.logs;
        logs.forEach((elem, index) => {
          if (
            elem.topic0 ===
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
          ) {
            const number = this.roughScale(elem.data, 10);
            const SalePrice = this.math.toHumanValue(number.toString(), 18)
            element.price = SalePrice
            console.log(
              'NUMBER: ',
              this.math.toHumanValue(number.toString(), 18)
            );
          }
        });
      }); */
      // console.log(lastSells);
      /* const address1 = t.logs[0].address;
        const address2 = t.logs[2].address;
        console.log(address1);
        console.log(address2);
        
        const data1 = logs[0].data;
        const data2 = logs[2].data;
        console.log(this.math.toHumanValue(parseInt(Number(data1), 10), 18));
        console.log(this.math.toHumanValue(parseInt(Number(data2), 10), 18));
        const SalePrice = this.math.toHumanValue(parseInt(Number(data1), 10), 18) + this.math.toHumanValue(parseInt(Number(data2), 10), 18)
        element.price = SalePrice
        console.log(SalePrice); */
    } catch (e) {
      console.log(e);
    }
    if (this.lastSells === []) {
      return;
    }
    this.lastSells = lastSells.sort(
      (a, b) => (a.created > b.created && -1) || 1
    );
    this.loadingLastSells = false;
  }

  /* async approveMatic(): Promise<void> {
    if ((await this.walletService.getNetwork()) !== Network.ETH) {
      alert('Connect to Ethereum network first');
      return;
    }
    this.loading = true;
    try {
      await this.nft.setApprovalForAll(
        environment.maticPredicate,
        this.preData.network
      );
      // await this.checkApproveMatic();
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
  } */

  /*  async sendToMatic(): Promise<void> {
    if ((await this.walletService.getNetwork()) !== Network.ETH) {
      alert('Connect to Ethereum network first');
      return;
    }
    this.loading = true;
    try {
      await this.matic.sendToMatic(this.preData.id);
      alert(
        'Transfer ordered! You will receive your token on Matic in about 10 minutes.'
      );
      this.loadData();
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
  } */

  /*  async sendToEthereum(): Promise<void> {
    if ((await this.walletService.getNetwork()) !== Network.MATIC) {
      alert('Connect to Matic network first');
      return;
    }
    this.loading = true;
    try {
      await this.matic.sendToEthereum(this.preData.id);
      alert(
        'Transfer ordered! Change to "Ethereum" network on Metamask and go to your "Profile" section in order to claim your token.'
      );
      this.loadData();
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
  } */

  async loadSale(): Promise<void> {
    console.log('load slae');
    this.saleId = await this.market.getLastSaleIdByToken(this.preData.network, this.preData.tokenAddress, this.preData.id);
    this.auctionOrSaleData = await this.market.getSaleById(this.saleId, this.preData.network);
    if(this.saleId == 0 && this.auctionOrSaleData?.tokenId != this.preData.id) {
      console.log("No sales");
      return;
    }
    console.warn(this.auctionOrSaleData, 'auctionOrSaleData');
    if (this.auctionOrSaleData && this.auctionOrSaleData.available) {
      this.loadDigiTrade = true;
      this.isAuction = this.auctionOrSaleData.isAuction;
      console.warn('asdf');
      this.buy = true;
      this.paymentCurrencyERC20 = this.coinListService.getCoinDetails(this.auctionOrSaleData.paymentCurrency, this.preData.network);
      this.price = this.math.toHumanValue(this.auctionOrSaleData.fixedPrice,  this.paymentCurrencyERC20.decimalPlaces );
      this.priceDecimals = parseInt(this.auctionOrSaleData.fixedPrice, undefined);
      console.log("Price", this.price);
      this.endDate = this.auctionOrSaleData.endDate;
      console.log("END DATE:", this.auctionOrSaleData.endDate);      
      console.log("Auct/Sale data",  this.auctionOrSaleData);
      this.setPaymentCurrencyName();
      this.getAllowed();
    
    }
    this.cdr.detectChanges();
  
    console.log("Loading Sale Data Complete");
  }

  async loadAuction(): Promise<void> {
    console.log("loading auction info");
    this.loading = true;
    const auctionId = await this.market.getAuctionIdByToken(
      parseInt(this.preData.id + '', undefined),
      this.preData.network,
      this.preData.tokenAddress
    );
    this.auctionId = auctionId;
    console.log("Got Auction Id", this.auctionId);
   
    if (auctionId !== null) {
      const auction = await this.market.getAuctionById(
        auctionId,
        this.preData.network
      );
      console.log("loading auction info", auctionId, auction);
      if (auction) {
        this.loadDigiTrade = true;
        this.auctionOwner = auction.owner;
       
        await this.getOwner();
        if (
         this.ownerAddress.toLowerCase()  ===
          this.market.getMyContractAddressByNetwork(this.preData.network).toLowerCase()
        ) {
          console.log("Auction Contract Holds This NFT", this.ownerAddress, this.address);
         
          if(this.auctionOwner.toLowerCase() === this.address.toLowerCase()){
            this.isYours = true;
            this.ownerAddress = auction.owner;
          }
          console.log(this.auctionOwner, 'this auction owner');
          this.verifiedSeller = await this.verifiedProfiles.getVerifiedName(
            this.auctionOwner        
          );

          if(!auction.available){
            this.canClaimBackFromAuction = true;
          }
        } else if (
          this.address && this.auctionOwner.toLowerCase() === this.address.toLowerCase()
        ) {
          console.log("===== this.auctionOwner ====");
          console.log(this.auctionOwner);
          console.log("===== auction Owner ====");
          console.log(auction.owner);
          this.isYours = true;
          this.ownerAddress = auction.owner;
          this.verifiedSeller = await this.verifiedProfiles.getVerifiedName(
            this.ownerAddress
          );
        } 
      
        this.auctionOrSaleData = auction;
        if (auction.available) {
          console.log('auction is available');
          this.auction = true; 
          this.isAuction = true;        
          this.auctionOrSaleData.paymentCurrency =
            this.auctionOrSaleData.paymentCurrency;
          let _price = await this.nft.getAuctionPrice(
            auctionId,
            auction,
            this.preData.network
          );
          this.winnerAddress = _price.winner;
          this.paymentCurrencyERC20 = this.coinListService.getCoinDetails(this.auctionOrSaleData.paymentCurrency, this.preData.network);
          this.price = this.math.toHumanValue(this.auctionOrSaleData.fixedPrice,  this.paymentCurrencyERC20.decimalPlaces );
         
          const winnerName = await this.verifiedProfiles.getVerifiedName(
            _price.winner
          );
          if (
            this.address &&
            Notification.permission === 'granted' &&
            _price.winner === this.address
          ) {
            this.highestBid = setInterval(async () => {
              _price = await this.nft.getAuctionPrice(
                auctionId,
                auction,
                this.preData.network
              );
              if (_price.winner !== this.address) {
                // tslint:disable-next-line: no-unused-expression
                new Notification('You have been outbid!');
                clearInterval(this.highestBid);
                this.loadData();
              }
            }, 10000);
          }

          if (_price.winner === '0x0000000000000000000000000000000000000000') {
            // console.log('NO WINNER');
            this.winner = null;
            this.winnerIsVerified = false;
          } else if (winnerName) {
            const profile = await this.verifiedProfiles.getFullProfile(
              _price.winner
            );
            this.winner = profile.username;
            this.winnerIsVerified = true;
          } else {
            // console.log('WINNER', price.winner);
            this.winner = _price.winner;
            this.winnerIsVerified = false;
          }

          this.priceBuyNow = this.math.toHumanValue(auction.fixedPrice.toString(), 18);
          this.priceBuyNowDecimals = parseInt(auction.fixedPrice.toString(), undefined);
          this.endDate = auction.endDate;
        }
       
        this.checkNetwork();
        this.checkApprovedForBid();
       
        this.setPaymentCurrencyName();
        this.getAllowedAuction();
        this.getLastBids();
       
      }
      else{
        this.isAuction = false;
      }
     
    
      
    
     
    }
 
    this.cdr.detectChanges();

    console.log("Loading Auction Complete", this.auction);
  }

  async getLastBids(): Promise<void> {
    // NEEDS TO FIX

    // this.loadingLastBids = true;
    // this.lastBids = null;
    // try {
    //   const bids = await this.nft.getLastBids(
    //     this.auctionId,
    //     4,
    //     this.preData.network
    //   );
    //   this.lastBids = bids;
    //   console.log(this.lastBids);
    //   this.loadingLastBids = false;
    // } catch (e) {
    //   console.log('getLastBids ERROR ::', e);
    //   this.loadingLastBids = false;
    // }
    // this.cdr.detectChanges();
  }

  async getCardDetails(): Promise<void> {
    this.loading = true;
    let card;
    try {
      card = await this.moralis.getNftDataFromMoralis(
        this.preData.tokenAddress,
        this.preData.id,
        this.preData.network
      );
      this.data = Object.assign(this.preData, card);
      this.data.tokenData.isVideo = false;
      this.data.tokenData.attributes.map((item) => {
        if (item.trait_type === 'Video' && item.value === 'Yes') {
          this.data.tokenData.isVideo = true;
        }
      });
      if (card.tokenData) {
        this.name = card.tokenData.name;
        this.data.name = card.tokenData.name;
        this.data.description = card.tokenData.description;
        this.data.image = card.tokenData.image;
        this.attributes = card.tokenData.attributes;
        this.data.attributes = card.tokenData.attributes;
        this.id = this.preData.id;
        console.log('Card: ' + this.preData.id);
      } else {
        (this.name = `#${this.preData.id.toString()} - UNREADABLE JSON`),
          (this.data.name = `#${this.preData.id.toString()} - UNREADABLE JSON`),
          (this.data.description = 'Cant get token data for this NFT');
        this.data.image = '';
        this.attributes = [];
        this.data.attributes = [];
        this.unreadableJson = true;
      }
      this.data.owner = card.owner_of;
      this.ownerAddress = card.owner_of;
      // Gets wallet network
      const network = this.getNetworkData(this.preData.network);
      this.data.walletNetwork = network.name.toUpperCase();
      if (this.data.tokenData.attributes) {
        this.physical = this.data.tokenData.attributes.find(
          (x) => x.trait_type === 'Physically Backed'
        )?.value;
      }
      
      await this.getOwner();
      if (this.data.owner_of === '0x000000000000000000000000000000000000dEaD') {
        const tx = await this.nft.getBurnTransaction(this.preData.id);

        if (tx[0].blockNumber) {
          const txData = await this.walletService
            .getWeb3()
            .eth.getBlock(tx[0].blockNumber);

          const date = new Date(txData.timestamp * 1000);
          this.burnDate = this.datepipe.transform(date, 'yyyy/MM/dd HH:mm:ss');
        }
      }
      if (this.physical) {
        this.getPhygitalStatus();
      }
      this.getRoyalty(this.address, this.preData.network);
      this.cdr.detectChanges();
    } catch (e) {
      console.error(e);
      // await this.router.navigate(['/']);
      return;
    }
  }

  async getPhygitalStatus(): Promise<void> {
    try {
      await this.digitrack.accessgetStatus(
      this.preData.tokenAddress, this.preData.id).then((res) => {
        if(res.length > 0) this.phygitalStatus = res;
        console.log("Phygital Status is " + this.phygitalStatus);
      })
    }
    catch (e) {
      this.showAlertMessage = true;
      this.error_message = e.message;
      return;
    }
  }

  async getOwner(): Promise<void> {
    
    const ownerAddress = this.data.owner_of;
    // try {
    //   this.address = await this.walletService.getAccount();
    // } catch (e) {
    //   this.showAlertMessage = true;
    //   this.error_message = e.message;
    //   return;
    // }
    console.log("=========== get owner ========");
    console.log(this.data.owner_of);
    console.log(ownerAddress);
    const network = this.getNetworkData(this.preData.network);
    this.data.walletNetwork = network.name.toUpperCase();
    this.explorerPrefixOfOwner = network.prefix;
    this.ownerAddress = ownerAddress;

    if (ownerAddress === '0x000000000000000000000000000000000000dEaD') {
      const tx = await this.nft.getBurnTransaction(this.preData.id);

      if (tx[0].blockNumber) {
        const txData = await this.walletService
          .getWeb3()
          .eth.getBlock(tx[0].blockNumber);

        const date = new Date(txData.timestamp * 1000);

        this.burnDate = this.datepipe.transform(date, 'yyyy/MM/dd HH:mm:ss');
      }
    }
    console.log("============== owner address ===========");
    console.log(this.ownerAddress)
    
    this.verifiedSeller = await this.verifiedProfiles.getVerifiedName(
      this.ownerAddress
    );


    console.log("Verified Seller:" , this.verifiedSeller);
    console.log(this.address);
    if(this.address) {
      this.isDigisafe = await this.digitrack.isWalletDigiSafe(this.address);
      if(!this.isAuction) {
      this.isYours =  ownerAddress.toLowerCase() === this.address.toLowerCase();
      }
    }
    this.cdr.detectChanges();
    this.getRoyalty(ownerAddress, this.preData.network);
   
  }

  async checkNetwork(): Promise<void> {
   
    console.log("Verifiying", this.preData);
    this.walletService.getNetwork().then((network: Network) => {
      const networkData = this.getNetworkData(network);
      this.data.walletNetwork = networkData.name;
      console.log("Network: ", networkData);

      if (this.data.walletNetwork !== this.preData.network) {
        console.log("I am not the wrong network! Must be on ", this.preData.network, " I am on ", this.data.walletNetwork);
        this.showAlertMessage = true;
        this.amIonRightNetwork = false;
        this.error_message = `Connect to the ${this.preData.network} network to interact with this NFT.`;
        return;
      }
      this.amIonRightNetwork = true;
      console.log("I am on the right network");
      this.explorerPrefix = networkData.prefix;
      this.cdr.detectChanges();
    });
    this.contractAddress = this.preData.tokenAddress;

    this.cdr.detectChanges();
  }

  switchToMatic(): void {
    this.walletService.switchToMatic();
  }

  onChangeInput(): void {
    this.showAllow = this.inputAmount * 10 ** 18 > this.allowed;
    this.lowBid = this.inputAmount < this.price;

    if (this.winner !== null) {
      this.lowBid = this.inputAmount <= this.price;
    }
  }
  async getAllowedAuction(): Promise<void> {
    try {
      if (this.auction) {
        console.log('al auction');
        this.bidApprovedQty = await this.nft.allowedTokenFor(
          this.market.getMarketplaceAddress(this.preData.network),
          this.preData.network,
          this.auctionOrSaleData.paymentCurrency
        );
        console.log(
          'CURRENCY:' +
          this.auctionOrSaleData.paymentCurrency +
          ' is approved for ' +
          this.bidApprovedQty
        );
        if (this.bidApprovedQty === 0) {
          this.showAllow = true;
        } else {
          this.showAllow = false;
        }
      }
    } catch (e) {
      console.log('allowedTokenFor ERROR ::', e);
    }
  }

  async getAllowed() {
    console.log('here, buddy');
    if(!this.address) {
      
      this.address = await this.walletService.getAccount();
      if(!this.address) {
        console.log("NO ADDRESS");
        return;
      }
     
    }
    if (this.data && this.auctionOrSaleData) {
    

      try {
        if (this.auctionOrSaleData.available) {
          console.log('Getting this.allowed For MARKET:', 
          this.market.getMarketplaceAddress(this.preData.network),
          this.preData.network,
          this.auctionOrSaleData.paymentCurrency);
          console.log(this.auctionOrSaleData, this.preData);
          this.allowedMarket = await this.nft.allowedTokenFor(
            this.market.getMarketplaceAddress(this.preData.network),
            this.preData.network,
            this.auctionOrSaleData.paymentCurrency
          );
          this.allowedMarket = parseInt(this.allowedMarket, undefined);
          if(this.allowedMarket >= this.priceDecimals) {
            this.isApprovedForBuy = true;
          }
          console.log('this.allowed For MARKET:', this.allowedMarket, this.priceDecimals);

        }
      } catch (e) {
        console.log('allowedTokenFor ERROR ::', e);
      }
    }
  }

  onBlur(evt): void {
    if (evt.target.valueAsNumber) {
      this.inputAmount = evt.target.valueAsNumber.toFixed(2);
      console.log(this.inputAmount);
    }
  }

  async approveMarket(): Promise<void> {
    this.loading = true;
    let currency;
    if (this.auctionOrSaleData) {
      currency = this.auctionOrSaleData.paymentCurrency;
    }
    try {
      await this.nft.approve(
        this.market.getMarketplaceAddress(this.preData.network),
        this.preData.network,
        this.auctionOrSaleData.paymentCurrency
      );
    } catch (e) {
      console.log(e);
    }
    await this.getAllowed();
    this.loadData();
    this.loading = false;
  }

  async cancelMarket(): Promise<void> {
    this.loading = true;
    try {
      await this.market.cancelSale(this.saleId, this.preData.network);
    } catch (e) { }
    this.loading = false;
    this.loadData();
  }

  async cancelAuction(): Promise<void> {
    // if ((await this.walletService.getNetwork()) !== Network.MATIC) {
    //   alert('Connect to Matic network first');
    //   return;
    // }
    this.loading = true;

    try {
      await this.market.cancel(this.auctionId, this.preData.network);
    } catch (e) { }
    this.loading = false;
    this.loadData();
  }




  async buyFromMarket(): Promise<void> {
    this.loading = true;
    if(!this.saleId) {
    await this.loadSale();
    }
    if(!this.saleId) {
      console.log("No sale dataa");
      return;
      }

    
    console.log("BUYING", this.saleId);
    try {
      await this.market.buy(this.saleId, this.preData.network);
    } catch (e) {
      console.log(e);
    }
    this.loading = false;
    this.loadData();
  }

  async approveBuy(): Promise<void> {
    await this.checkNetwork();
    if(!this.amIonRightNetwork || !this.auctionOrSaleData){
      return;
    }
    
    
    this.loading = true;
    try {
      await this.market.approveMeToSpendErc20(this.preData.network, this.auctionOrSaleData.paymentCurrency);
      
    } catch (e) {
      console.error(e);
    }
    this.getAllowedAuction();
    this.onChangeInput();
    this.cdr.detectChanges();
    this.loadData();
    this.loading = false;
  }



  async approveBid(): Promise<void> {
   return await this.approveBuy();
  }

  async directBuy(): Promise<void> {
    if ((await this.walletService.getNetwork()) !== Network.MATIC) {
      this.switchToMatic();
      return;
    }
    this.loading = true;
    try {
      await this.market.directBuy(this.auctionId, this.preData.network);
    } catch (e) {
      this.showAlertMessage = true;
      this.error_message = e.message;
    }
    this.loading = false;
    // this.loadData();
  }

  async bid(): Promise<void> {
    if ((await this.walletService.getAccount()) === null) {
      alert('Connect your wallet first!');
      return;
    }
    this.loading = true;
    try {
      await this.market.bid(
        this.auctionId,
        this.math.toBlockchainValue(this.inputAmount, 18),
        this.preData.network
      );
    } catch (e) {
      console.error(e);
      this.showAlertMessage = true;
      this.error_message = e.message;
    }
    this.loading = false;
    this.loadData();
  }

  async sign(): Promise<string> {
    return await this.walletService.signMessage(this.fullDescription);
  }



  async burnNFT(id: number): Promise<void> {
    console.log("BURN NFT 🔥🔥🔥", id);
    this.loading = true;
    // if ((await this.walletService.getNetwork()) !== Network.ETH) {
    //   alert('Connect to Ethereum network first');
    //   this.loading = false;
    //   return;
    // }

    this.burnTokenModal.nativeElement.click();
    await this.nft.burn(this.network, this.contractAddress, this.id);
  
    this.loadData();
    this.loading = false;
  }

  goBack(): void {
    if (this.canGoBack) {
      this.location.back();
    } else {
      this.router.navigate(['/'], { relativeTo: this.route });
    }
  }

  fillDescriptionFields(): void {
    if (typeof this.description === 'object' && this.description !== null) {
      this.inputPublisher = this.description.publisher;
      this.inputEdition = this.description.edition;
      this.inputYear = this.description.year;
      this.inputGraded = this.description.graded;
      this.inputPopulation = this.description.population;
      this.inputDescription = this.description.description;
    }
  }
  calculate(event: KeyboardEvent): void {
    this.amountInput = (<HTMLInputElement>event.target).value
  }
  
  keepOriginalOrder = (a, b) => a.key;

  setPaymentCurrencyName(): void {
    if (this.auctionOrSaleData && this.auctionOrSaleData.paymentCurrency) {
     
        this.paymentCurrencyName = this.getPaymentCurrencyName(this.preData.network, this.auctionOrSaleData.paymentCurrency);
     
      }else{
        console.log("Could not set paymentCurrencyName");
        
      }

    
    }
  

  getPaymentCurrencyName(network:string, paymentAddress: string): string {
  
      if (
        paymentAddress ==
        environment.maticCoinContractAddresses.digiAddressMatic
      ) {
        return 'DIGI';
      } else if (
       paymentAddress ==
        environment.maticCoinContractAddresses.wethAddressMatic
      ) {
        return 'WETH';
      } else if (
       paymentAddress ==
        environment.maticCoinContractAddresses.maticCoinAddress
      ) {
        return 'MATIC';
      } else if (
       paymentAddress ==
        environment.maticCoinContractAddresses.usdcAddressMatic
      ) {
        return 'USDC';
      } else if (
       paymentAddress ==
        environment.maticCoinContractAddresses.usdtAddressMatic
      ) {
        return 'USDT';
      } else if (
       paymentAddress ==
        environment.maticCoinContractAddresses.linkAddressMatic
      ) {
        return 'LINK';
      }

  }





  async setPhygitalRedemptionReady(){
    this.setPhygitalStatus("Digisafe - Redemption Ready");
  }



async setPhygitalStatus(newStatus: string){
  if(!this.physical){
    console.log("not physical item");
    return;
  }

  try{
    this.loading = true;
    await this.digitrack.updateStatus(this.preData.tokenAddress, this.preData.id, newStatus, this.preData.network, this.address);
    await this.getPhygitalStatus();
    this.loading = false;
  }
  catch(e){

    console.log("Set Phygital Status Error",this.preData.network, "digisafe:", this.address, e);
  }
}

}

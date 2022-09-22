import { Component, Input, OnInit } from '@angular/core';
import { MoralisService } from 'src/app/services/moralis.service';
import { OffchainService } from 'src/app/services/offchain.service';
import { WalletService } from 'src/app/services/wallet.service';
import { DigiService } from 'src/app/services/digi.service';
import { DigiTradeService } from 'src/app/services/digitrade.service';
import { MathService } from 'src/app/services/math.service';
import { digitradeOffer } from 'src/app/types/digitrade-offer.type';
import { max } from 'mathjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-moralis-card',
  templateUrl: './moralis-card.component.html',
  styleUrls: ['./moralis-card.component.scss'],
})
export class MoralisCardComponent implements OnInit {
  @Input() data: any = {};
  @Input() getSale: boolean = false;

  owner: string;
  address: string;
  ownerUsername: string;
  physical: string;
  network: string;
  image = '/assets/images/cards/loading.png';
  backImage = '/assets/images/cards/loading.png';
  name = '...';
  description = '...';
  tokenAddress;
  showZoomImage: boolean = false;
  imageObject: Array<object> = [];
  isMakeOffer: boolean = false;
  digiTokenBalance;
  digiTradeMakeOffferFee;
  digiTradeAcceptOfferFee;
  approvedDigiTradeSpendCurrency: boolean = false; 
  approvedDigiTradeToSpendDIGIforFees: boolean = false;
  paymentCurrencyDigiTrade;
  paymentCurrencyNameDigiTrade;
  amountInput;
  saleData;
  paymentCurrencyBalanceDigiTrade;
  currencyDropDownMaticDigiTrade = [
    {
      name: 'DIGI',
      id: environment.maticCoinContractAddresses.digiAddressMatic,
    },
    {
      name: 'USDC',
      id: environment.maticCoinContractAddresses.usdcAddressMatic,
    },
    {
      name: 'USDT',
      id: environment.maticCoinContractAddresses.usdtAddressMatic,
    },
  
    {
      name: 'MATIC',
      id: environment.maticCoinContractAddresses.maticCoinAddress,
    },
  
    {
      name: 'LINK',
      id: environment.maticCoinContractAddresses.linkAddressMatic,
    },
  ];

  constructor(
    private moralis: MoralisService,
    private offchain: OffchainService,
    private wallet: WalletService,
    private readonly digiservice: DigiService,
    private readonly digitrade: DigiTradeService,
    private readonly math: MathService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.loadOffChainData();
    this.network = await this.wallet.getNetwork();
  }

  async loadOffChainData(): Promise<void> {
    if (this.data?.tokenData) {
      if (this.data && this.data.tokenData && this.data.tokenData.image && this.data.tokenData.image.changingThisBreaksApplicationSecurity && this.data.tokenData.image.changingThisBreaksApplicationSecurity.indexOf('ipfs://') != -1) {
        const rep =
          this.data.tokenData?.image?.changingThisBreaksApplicationSecurity.replace(
            /^ipfs?:\/\//,
            ''
          );
        this.data.tokenData.image = `https://digible.mypinata.cloud/ipfs/${rep}`;
        this.data.tokenData.image = this.data.tokenData.image.changingThisBreaksApplicationSecurity;
      }
      this.data.tokenData.isVideo = false;
      if (typeof this.data.tokenData?.attributes?.length === 'number') {
        this.data.tokenData?.attributes?.map((item) => {
          if (item.trait_type === 'Video' && item.value === 'Yes') {
            this.data.tokenData.isVideo = true;
          }
          if (item.trait_type === 'Physically Backed') this.physical = item.value;
        });
      } else if (typeof this.data.tokenData?.attributes === 'object') {
        if (this.data.tokenData?.attributes.content_type?.includes('video')) this.data.tokenData.isVideo = true;
      }
      if (this.data.pendingAuction) {
        const card = await this.moralis.getNftDataFromMoralis(
          this.data.nftAddress,
          this.data.id,
          this.data.network
        );
        if (card.tokenData) {
          this.physical = card.tokenData.attributes.find(
            (x) => x.trait_type === 'Physically Backed'
          )?.value;
        }
        const newObj = { ...this.data, ...card };
        this.data = newObj;
      }
      this.imageObject.push({ image: this.data.tokenData?.image });
    }
    if (!this.getSale) return;
    // this.saleData = await this.offchain.getSaleDataByTokenId(this.data.token_id, this.data.network);
    // const curTime = new Date().getTime() / 1000;
    // const walletAddress = await this.wallet.getAccount();
    // if (this.saleData != false && this.saleData.owner.toLowerCase() !== walletAddress.toLowerCase() && !this.saleData.isAuction && parseInt(this.saleData.finalPrice, 10) === 0 && parseInt(this.saleData.endDate, 10) > curTime ) {
    //   this.isMakeOffer = true;
    //   await this.loadDigiTradeInfo();
    // }
  }

  async processNewTradeCurrency(){
    this.getSetTradeCurencyBalance();
    const approvedAmount = await this.digitrade.HowMuchAmIApprovedToSpendErc20(this.network, this.paymentCurrencyDigiTrade);
    console.log(approvedAmount, 'approved amoun');
    if(approvedAmount > 1000000000000000000000000){
      this.approvedDigiTradeSpendCurrency = true;  
    }
    else{
      this.approvedDigiTradeSpendCurrency = false;  
    }
    console.log("Spend Currency", this.paymentCurrencyDigiTrade, this.approvedDigiTradeSpendCurrency);
  }

  calculate(event: KeyboardEvent): void {
    this.amountInput = (<HTMLInputElement>event.target).value
  }

  currencyHandlerDigiTrade() {
    this.currencyDropDownMaticDigiTrade.forEach((item) => {
      if (item.id === this.paymentCurrencyDigiTrade) {
        this.paymentCurrencyNameDigiTrade= item.name;
        this.paymentCurrencyDigiTrade = item.id;
      }
    });

    this.processNewTradeCurrency();
    console.log(this.paymentCurrencyDigiTrade, this.paymentCurrencyNameDigiTrade)
  }

  async loadDigiTradeInfo(){

    console.log("Loading DigiTrade Info");
    this.getSetDigiBalance();
    
    // 1. Fees for Making Offer, Accepting Offer and ERC2 DIgi Approval
  
    this.digiTradeMakeOffferFee = await this.digitrade.getFeeToMakeOffer(this.network);
    console.log("offer fee", this.digiTradeMakeOffferFee);
    this.digiTradeAcceptOfferFee = await this.digitrade.getFeeToAcceptOffer(this.network);
    const approvedAmount = await this.digitrade.HowMuchAmIApprovedToSpendErc20(this.network, this.digiservice.getDigiContractAddressByNetwork(this.network));
    console.log("Approved to Spend DIGI", approvedAmount);
  
    if(approvedAmount > max(this.digiTradeAcceptOfferFee, this.digiTradeMakeOffferFee)){
      this.approvedDigiTradeToSpendDIGIforFees = true;
  
    }

    // 2. Pre-load offer currency, if existing sale use that otherwise use digi
    if(this.saleData && this.saleData.paymentCurrency) {
  
      this.paymentCurrencyDigiTrade = this.saleData.paymentCurrency;
      this.currencyDropDownMaticDigiTrade.forEach((item) => {
        if (item.id === this.paymentCurrencyDigiTrade) {
          this.paymentCurrencyNameDigiTrade= item.name;
        }
      });
    }
  
    else{
      this.paymentCurrencyDigiTrade = this.digiservice.getDigiContractAddressByNetwork(this.network);
      this.paymentCurrencyNameDigiTrade = 'DIGI';
    }
    await this.getSetTradeCurencyBalance();
    console.log("Loading DigiTrade Info Complete");
  }

  async getSetTradeCurencyBalance() {
    this.paymentCurrencyBalanceDigiTrade = await this.wallet.getTokenBalance(this.paymentCurrencyDigiTrade, this.network);
  }

  async getSetDigiBalance() {
    this.digiTokenBalance = await this.digiservice.getDigiBalanceByNetwork(this.network);
    console.log("Digi Token Balance ", this.network, this.digiTokenBalance);
  }

  closeEventHandler(): void {
    this.showZoomImage = false;
  }

  async goToDetail(e) {
    if (e.target.tagName != 'BUTTON') document.getElementById('goDetailAnchor_' + this.data.token_id).click();
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
      var offer: digitradeOffer = {wallets: [this.address, this.saleData.owner]};
      offer.erc20QtyRequested = "0";
      offer.addresses = ["", "", this.paymentCurrencyDigiTrade, this.saleData.nftContractAddress, "",""];
      offer.nftTokenIds= ["0", "0", this.saleData.tokenId, "0"];
      offer.erc20QtyOffered = this.math.toBlockchainValue(this.amountInput);
    
      await this.digitrade.makeOffer(offer)      
      } catch(e) {
        console.log(e)
      }

    let el = document.querySelector("#offerModal button.close")  as HTMLInputElement;
    el.click();
  }
}

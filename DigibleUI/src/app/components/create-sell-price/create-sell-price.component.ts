import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletService } from 'src/app/services/wallet.service';
import { environment } from 'src/environments/environment';

import { MathService } from '../../services/math.service';
import { NftService } from '../../services/nft.service';

import { MarketplaceAndAuctionService } from 'src/app/services/marketandauction.service';
import { DigiService } from 'src/app/services/digi.service';
import { ERC20Currency } from 'src/app/types/ERC20currency.type';
import { MoralisService } from 'src/app/services/moralis.service';
import { CoinListService } from 'src/app/services/coinlist.service';


@Component({
  selector: 'app-create-sell-price',
  templateUrl: './create-sell-price.component.html',
  styleUrls: ['./create-sell-price.component.scss'],
})
export class CreateSellPriceComponent implements OnInit {
  data: any = {};
  preData: any = {};
  id;
  network;
 
  pageLoading = true;
  transactionLoading = false;
  inputAmount;
  stableSymbol = environment.stableCoinSymbol;
  digibleNftAddress;
  isApproved;
  fee;
  royaltyFee;
  sale;
  selectedDate;
  hasRoyalty = false;
  listingPrice;
  enoughDigiBalance;
  receiveAmount;
  paymentCurrencyERC20: ERC20Currency;
  paymentCurrencyName = 'DIGI';
  allowedCurrency;
  minDigiAmount: number;
  myDigiBalance: number;
  
  
  constructor(
    private readonly route: ActivatedRoute,
    private readonly digiService: DigiService,
    private readonly marketService: MarketplaceAndAuctionService,
    private readonly math: MathService,
    private readonly router: Router,
    private readonly wallet: WalletService,
    private readonly cdr: ChangeDetectorRef,
    private readonly moralisService: MoralisService,
    private readonly coinListService: CoinListService
  ) {}

  ngOnInit(): void {
    const date = new Date();
    date.setDate(date.getDate() + 14); // In two weeks
    this.selectedDate = date;       
    this.route.params.subscribe((queryParams) => {
      this.preData = {
        id: queryParams.id,
        network: queryParams.network,
        tokenAddress: queryParams.tokenAddress,
      };
    });
    this.loadData();
  } 



  async loadData(): Promise<void> {
   
    this.data = {
      ...(await this.moralisService.getNftDataFromMoralis(
        this.preData.tokenAddress,
        this.preData.id,
        this.preData.network
      )),
      ...this.preData,
    };
   
    console.log(this.data, this.preData, 'create sell');
    
    await this.getCardDetails();    
    await this.checkSale();
    await this.checkApprove();    
    await this.loadFee();
    await this.checkSetMinAmountAndDigiBalance();
    this.setInitialCurrency();

    
   
    console.log("Loading Complete");
  }

 


  async loadFee(): Promise<void> {
    this.fee = await this.marketService.getFee(this.data.network);
  }

 

  async getCardDetails(): Promise<void> {
    if (this.data.token_uri) {
      let url = this.data.token_uri;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          // console.log('TOKEN_URI DATA: ', data);
          this.data.image = data.image;
          this.data.name = data.name;
          this.data.description = data.description;
          this.data.owner = this.data.owner_of;
          this.data.ownerAddress = this.data.owner_of;
          this.data.network = this.data.network;
          this.data.physical = data.physical;
          this.data.tokenAddress = this.data.token_address;
        })
        .then((data) => {
          this.pageLoading = false;
        })
        .catch((err) => {
          console.log(err);
        });
    }

    await this.getRoyalty();
  }


  // 2. IS THIS ALREADY ON SALE?
  async checkSale(): Promise<void> {
    const sale = await this.marketService.getSaleForToken(
      this.preData.tokenAddress,
      parseInt(this.data.id, undefined),
      this.preData.network
    );

    if (sale && sale.available) {
      this.sale = sale;
    }
  }




  async getRoyalty(): Promise<void> {
    this.hasRoyalty = await this.marketService.hasRoyalty(
      this.data.tokenAddress,
      this.data.id,
      this.data.network,
      this.data.owner_of
    );

    if (this.hasRoyalty) {
      this.royaltyFee =
        (await this.marketService.getRoyaltyFee(
          this.data.id,
          this.data.network,
          this.data.tokenAddress
        )) / 100;
    }
  }


  async checkApprove(): Promise<void> {
    this.isApproved = await this.marketService.amIApprovedAllERC721(
      this.data.tokenAddress,
      await this.wallet.getAccount(),      
      this.data.network
      
    );
    console.log("Approved:" + this.isApproved);
    this.cdr.detectChanges();
  }

 async approveSell(){
await this.wallet.approveAllErc721(this.data.tokenAddress, await this.marketService.getMyContractAddressByNetwork(this.preData.network));
await this.checkApprove();

 }


  async checkSetMinAmountAndDigiBalance(): Promise<void> {

    const digiBalance = await this.digiService.getDigiBalanceByNetwork(this.preData.network);
    console.log("My balance", digiBalance);
    
    var digi = this.coinListService.getCoinDetails(
      this.digiService.getDigiContractAddressByNetwork(this.preData.network),
      this.preData.network
    )
    console.log("GOT DIGI", digi);

    if (digiBalance < 3000 * 10 ** digi.decimalPlaces) {
      this.enoughDigiBalance = false;
    } else {
      this.enoughDigiBalance = true;
    }
  }

  async sell(): Promise<void> {
    this.transactionLoading = true;
    const endDate = parseInt(
      this.selectedDate.getTime() / 1000 + '',
      undefined
    );
    const currentDate = parseInt(new Date().getTime() / 1000 + '', undefined);

    if (!this.enoughDigiBalance) {
      alert('You need to hold at least 3,000 $DIGI');
      this.transactionLoading = false;
      return;
    }
    try {

    console.log("Using", this.paymentCurrencyERC20.contractAddress);
    

      await this.marketService.createSaleFromHumanPrice(
        this.data.id,
        this.data.tokenAddress,
        this.listingPrice,
        endDate - currentDate,        
        this.paymentCurrencyERC20
      );
      this.router.navigate(['profile/' + await this.wallet.getAccount()]);
    } catch (e) {
      console.error(e);
    }
    this.transactionLoading = false;
  }



// Price Input Handler

onChangeInputAmount(): void {
  setTimeout(() => {
    this.listingPrice = Number(this.inputAmount)
    let fee = this.listingPrice * .1;
    let royalty = 0;

    if (this.hasRoyalty) {
     royalty = this.listingPrice * (this.royaltyFee / 100);
    } 
    this.receiveAmount = (this.listingPrice - fee - royalty).toFixed(2)
  }, 100);
}




  //### PAYMENT CURRENCY CONFIGURATION AND HANDLING

currencyDropDown: any[] = [];


setInitialCurrency(){
  // Load dropdown with all available currencies
  this.currencyDropDown = this.coinListService.getSupportedCurrencyDropDownByNetwork(this.preData.network);


 
  this.paymentCurrencyERC20 = this.coinListService.getCoinDetails(this.currencyDropDown[0].id, this.preData.network);
  this.paymentCurrencyName = this.paymentCurrencyERC20.displayName;
  console.log("Current Payment Currency Set to", this.paymentCurrencyERC20); 

  
  
}
  currencyHandler (event: any) {
    console.log(event);
    this.paymentCurrencyERC20 = this.coinListService.getCoinDetails(event.id, this.preData.network);
    this.paymentCurrencyName = this.paymentCurrencyERC20.displayName;


  }
   
  


  currencyDropDownMatic = [
    {
      name: 'DIGI',
      id: environment.maticCoinContractAddresses.digiAddressMatic,
    },
    {
      name: 'USDC',
      id: environment.maticCoinContractAddresses.usdcAddressMatic,
    },
    // {
    //   name: 'USDT',
    //   id: environment.maticCoinContractAddresses.usdtAddressMatic,
    // },

    // {
    //   name: 'MATIC',
    //   id: environment.maticCoinContractAddresses.maticCoinAddress,
    // },

    // {
    //   name: 'LINK',
    //   id: environment.maticCoinContractAddresses.linkAddressMatic,
    // },
    /* { name: 'MATIC', id: environment.maticCoinContractAddresses.maticCoinAddress },
    { name: 'ETH', id: environment.maticCoinContractAddresses.ethAddressMatic }, */
  ];



}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MathService } from '../../services/math.service';
import { NftService } from '../../services/nft.service';
import { WalletService } from '../../services/wallet.service';
import { environment } from 'src/environments/environment';
import { Moralis } from 'moralis';
import { MarketplaceAndAuctionService } from 'src/app/services/marketandauction.service';
import { CoinListService } from 'src/app/services/coinlist.service';

@Component({
  selector: 'app-create-auction',
  templateUrl: './create-auction.component.html',
  styleUrls: ['./create-auction.component.scss'],
})
export class CreateAuctionComponent implements OnInit {
  data: any = {};
  preData: any = {};
  id;
  network;
  showSwitchToMatic;
  buyNowOption;
  buyNowPrice;
  minPrice;
  isApproved = false;
  loading = false;
  selectedDate;
  enoughBalance = true;
  canApprove = false;
  paymentCurrency;
  paymentCurrencyName;
  address;
  currencyDropDown = [];
  fee;
  Odet;
  royaltyFee;
  hasRoyalty = false;
  isYours;
  listingPrice;
  receiveAmount;
  listingPriceBuyNow;
  receiveAmountBuyNow;
  allowedCurrency;
  currencyDropDownValue;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly wallet: WalletService,
    private readonly cdr: ChangeDetectorRef,
    private readonly nft: NftService,
    private readonly router: Router,
    private readonly math: MathService,
    private readonly market: MarketplaceAndAuctionService,
    private readonly coinListService: CoinListService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((queryParams) => {
      this.preData = {
        id: queryParams.id,
        network: queryParams.network,
        tokenAddress: queryParams.tokenAddress,
      };
    });
    this.loadData();
  }


 
  currencyHandler() {
    this.currencyDropDown.forEach((item) => {
      if (item.id === this.paymentCurrency) {
        this.paymentCurrencyName = item.name;
        this.paymentCurrency = item.id;
      }
    });
  }

  async loadData(): Promise<void> {
    let chain;
    if (this.preData.network === 'MATIC') chain = environment.production ? '0x89' : '0x13881';
    else if (this.preData.network === 'BSC') chain = environment.production ? '0x38' : '0x61';
    console.log(chain, 'load Data chain');
    this.data = {
      ...(await Moralis.Web3API.token.getTokenIdMetadata({
        address: this.preData.tokenAddress,
        token_id: this.preData.id,
        chain: chain,
      })),
      ...this.preData,
    };
    console.log(this.data, 'getTokenIdMetadata');
    this.currencyDropDown = await this.coinListService.getSupportedCurrencyDropDownByNetwork(this.preData.network);
    console.log(this.currencyDropDown);
    if (this.currencyDropDown.length > 0) this.paymentCurrency = this.currencyDropDown[0].id;
    await this.checkApprove();
    await this.checkMinAmount();
    await this.loadFees();
    await this.loadRoyalty();
    await this.getCardDetails();
  }

  async getCardDetails(): Promise<void> {
    this.address = await this.wallet.getAccount();
    if (this.data.token_uri) {
      let url = this.data.token_uri;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          this.data.image = data.image;
          this.data.name = data.name;
          this.data.description = data.description;
          this.data.owner = this.data.owner_of;
          this.data.ownerAddress = this.data.owner_of;
          this.data.network = this.data.network;
          this.data.physical = data.physical;
          this.data.tokenAddress = this.data.token_address;
          if (this.data.owner_of.toLowerCase() === this.address.toLowerCase()) {
            this.isYours = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  async loadFees(): Promise<void> {
    this.fee = await this.market.getFee(this.data.network);
    console.log("Platform Fee", this.fee);
  }

  async loadRoyalty(): Promise<void> {
    this.hasRoyalty = await this.market.hasRoyalty(
      this.data.tokenAddress,
      this.data.id,
      this.data.network,
    );
    if (this.hasRoyalty) {
      this.royaltyFee =
        (await this.market.getRoyaltyFee(this.data.id, this.data.network, this.data.tokenAddress)) / 100;
    }
  }

  async checkMinAmount(): Promise<void> {
    const digiBalance = await this.nft.digiBalance();
    console.log(digiBalance, 'Digi token balance');
    if (digiBalance < 3000 * 10 ** 18) {
      this.enoughBalance = false;
    } else {
      this.enoughBalance = true;
    }
  }

  async checkApprove(): Promise<void> {
    this.isApproved = await this.market.amIApprovedAllERC721(
      this.data.tokenAddress,
      await this.wallet.getAccount(),      
      this.data.network
      
    );
    console.log("Approved:" + this.isApproved);
    this.cdr.detectChanges();
  }

  async approve(): Promise<void> {
    this.loading = true;
    try {
      await this.market.approveMeAllERC721(this.data.network, 
        this.data.tokenAddress);        
    
     await  this.checkApprove();
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
  }

  onChangeInputAmount(): void {
    this.checkIfCanApprove();
    setTimeout(() => {
      this.listingPrice = Number(this.minPrice)
      let fee = this.listingPrice * .1;
      let royalty = 0;

      if (this.hasRoyalty) {
       royalty = this.listingPrice * (this.royaltyFee / 100);
      } 
      this.receiveAmount = (this.listingPrice - fee - royalty).toFixed(2)
    }, 100);
  }

  onChangeBuyNowInputAmount(): void {
    this.checkIfCanApprove();
    setTimeout(() => {
      this.listingPriceBuyNow = Number(this.buyNowPrice);
      let fee = this.listingPriceBuyNow * .1;
      let royalty = 0;
      if (this.hasRoyalty) {
      royalty = this.listingPriceBuyNow * (this.royaltyFee / 100);
      } 
      this.receiveAmountBuyNow =
      (this.buyNowPrice - fee  - royalty).toFixed(2);
    }, 100);
  }

  async create(): Promise<void> {
    this.loading = true;

    const currentDate = parseInt(new Date().getTime() / 1000 + '', undefined);

    const endDate = parseInt(
      this.selectedDate.getTime() / 1000 + '',
      undefined
    );

    const duration = endDate - currentDate;

    try {
      let buyNowPrice = '0';
      if (this.buyNowOption) {
        buyNowPrice = this.math.toBlockchainValue(this.listingPriceBuyNow);
      }
      console.log(this.data.id, this.math.toBlockchainValue(this.listingPrice, this.coinListService.getCoinDetails(this.paymentCurrency, this.preData.network).decimalPlaces), buyNowPrice, duration, this.data.network, this.paymentCurrency, this.data.tokenAddress, 'auction ccc');
      await this.market.createAuction(
        this.data.id,
        this.math.toBlockchainValue(this.listingPrice, this.coinListService.getCoinDetails(this.paymentCurrency, this.preData.network).decimalPlaces),
        buyNowPrice,
        duration,
        this.data.network,
        this.paymentCurrency,
        this.data.tokenAddress
      );
      this.router.navigate(['/auctions']);
    } catch (e) {
      console.error(e);
    }

    this.loading = false;
  }

  async switchToMatic(): Promise<void> {
    await this.wallet.switchToMatic();
  }

  async switchToEth(): Promise<void> {
    await this.wallet.switchToEth();
  }

  async checkIfCanApprove(): Promise<void> {
    if (this.buyNowOption) {
      this.canApprove =
        this.buyNowPrice !== '' &&
        this.minPrice !== '' &&
        typeof this.selectedDate === 'object' &&
        this.selectedDate instanceof Date;
    }

    this.canApprove =
      this.minPrice !== '' &&
      typeof this.selectedDate === 'object' &&
      this.selectedDate instanceof Date;
  }
}

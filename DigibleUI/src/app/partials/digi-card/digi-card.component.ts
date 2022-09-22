import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { MarketplaceAndAuctionService } from 'src/app/services/marketandauction.service';
import { MathService } from 'src/app/services/math.service';
import { NftService } from 'src/app/services/nft.service';
import { OffchainService } from 'src/app/services/offchain.service';
import { VerifiedWalletsService } from 'src/app/services/verified-wallets.service';
import { environment } from 'src/environments/environment';
import { WalletService } from 'src/app/services/wallet.service';
import { CountdownFormatFn } from 'ngx-countdown';
import { CoinListService } from 'src/app/services/coinlist.service';
import { MoralisService } from '../../services/moralis.service';

@Component({
  selector: 'app-digi-card',
  templateUrl: './digi-card.component.html',
  styleUrls: ['./digi-card.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DigiCardComponent implements OnInit {
  @Input() data: any = {};
  @Input() config: any = {};
  @Input() id: number;
  @Input() router;
  @Input() price: number = null;
  @Input() auction: boolean;
  @Input() view: string;
  @Input() backSide = false;

  _network = environment.defaultNetwork;
  digiAddressMatic = environment.maticCoinContractAddresses.digiAddressMatic;
  usdcMaticAddress = environment.maticCoinContractAddresses.usdcAddressMatic;
  usdtMaticAddress = environment.maticCoinContractAddresses.usdtAddressMatic;
  maticCoinAddress = environment.maticCoinContractAddresses.maticCoinAddress;
  linkMaticAddress = environment.maticCoinContractAddresses.linkAddressMatic;
  auctionOrSaleData;
  customBorder: string;
  owner: string;
  address: string;
  ownerUsername: string;
  auctionOwner: string;
  symbol = environment.stableCoinSymbol;
  endDate;
  physical: boolean;
  image = '/assets/images/cards/loading.png';
  backImage = '/assets/images/cards/loading.png';
  description: {
    publisher: string;
    edition: string;
    year: string;
    graded: string;
    population: string;
    backCardImage: string;
    description: string;
  };
  offChainData;
  digibleNftAddress: string;
  name = '...';
  isInEth;
  paymentToken;
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
  isBackVideo = false;
  isVideo = false;

  constructor(
    private offchain: OffchainService,
    private nft: NftService,
    private math: MathService,
    private cdr: ChangeDetectorRef,
    private market: MarketplaceAndAuctionService,
    private readonly walletService: WalletService,
    private verifiedProfiles: VerifiedWalletsService,
    private moralis: MoralisService,
    private readonly coinlist: CoinListService,
  ) {}

  ngOnInit(): void {
    if ((this.data.price as any) === '') {
      this.data.price = null;
    }
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.getAddress();
    this.loadOffChainData().then((res) => {
      this.loadOwner();
    });
    this.paymentToken = this.coinlist.getCoinDetails(this.data?.auctionOrSaleData?.paymentCurrency, this.data?.network);
    this.data.price = this.math.withSuffixNumber(this.data?.price, this.paymentToken?.decimalPlaces);
    console.log(this.data.price);
    this.loadSale();
    console.log(this.data.auctionOrSaleData, 'auction or sale');
    
  }

  async loadSale(): Promise<void> {
    let contract;

    if (this.data.isCube) {
      contract = environment.nftCubesAddressMatic;
    } else {
      contract = await this.nft.getNftAddress(true);
    }

    let network = this._network;
    if(this.data.network){
      network = this.data.network;
    }
    const sale = await this.market.getSaleForToken(
      contract,
      parseInt(this.data.id + '', undefined),
      network
    );
    console.log(sale, 'sale data');
    
    if (sale !== null && sale.available) {
      this.data.auction = false;
      this.data.price = this.math.toHumanValue(sale.fixedPrice, this.paymentToken?.decimalPlaces);
      this.endDate = sale.endDate;
    }
    this.cdr.detectChanges();
  }

  async loadAuction(): Promise<void> {
    if (this.data.auction) {
      let network = this._network;
      if(this.data.network){
        network = this.data.network;
      }
      const auctionId = await this.nft.getAuctionIdByToken(
        parseInt(this.data.id + '', undefined),
        network,
        this.data.tokenAddress
      );
      if (auctionId !== null && auctionId !== undefined) {
        const auction = await this.nft.getAuctionById(
          auctionId,
          network
        );
        if (auction.available) {
          this.auctionOrSaleData = auction;
          this.data.auctionOwner = auction.owner;
          this.endDate = auction.endDate;
          this.endDate = this.endDate * 1000;
        }
      }
    }
    this.cdr.detectChanges();
  }

  async getAddress(): Promise<void> {
    this.address = await this.walletService.getAccount();
  }

  async loadOwner(): Promise<void> {
    // console.log(this.data);
    if (
      this.data.owner_of.toLowerCase() ===
        environment.digiAuctionAndMarketPlaceMatic.toLowerCase() ||
      this.data.owner_of.toLowerCase() ===
        environment.digiAuctionAndMarketPlaceEth.toLowerCase()
    ) {
      this.owner = this.data.auctionOrSaleData.owner;
    } else {
      this.owner = this.data.owner_of;
    }
    this.ownerUsername = await this.verifiedProfiles.getVerifiedName(
      this.owner
    );

    this.cdr.detectChanges();
  }

  async loadOffChainData() {
    
    if (this.data.auction) {
      this.config = {
        stopTime: new Date(
          this.data.auctionOrSaleData.endDate * 1000
        ).getTime(),
        format: 'DDd HHh mm:ss',
        formatDate: this.formatDate,
      };
    }
    if (this.data && this.data.auctionOrSaleData && this.data.auctionOrSaleData.available) {
      const card = await this.moralis.getNftDataFromMoralis(
        this.data.nftAddress,
        this.data.id,
        this.data.network
      );
      if (card.tokenData.attributes) {
        this.physical = card.tokenData.attributes.find(
          (x) => x.trait_type === 'Physically Backed'
        )?.value;
      }
      const newObj = { ...this.data, ...card };
      this.data = newObj;
    } else {
      const card = await this.offchain.getNftMetaData(
        this.data.nftAddress,
        this.data.id,
        this.data.network
      );
      if (card.tokenData.attributes) {
        this.physical = card.tokenData.attributes.find(
          (x) => x.trait_type === 'Physically Backed'
        )?.value;
      }
      const newObj = { ...this.data, ...card };
      this.data = newObj;
    }
  }

  keepOriginalOrder = (a, b) => a.key;
}

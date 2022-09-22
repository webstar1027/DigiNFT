import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NftService } from 'src/app/services/nft.service';
import { WalletService } from 'src/app/services/wallet.service';
import { OffchainService } from 'src/app/services/offchain.service';
import { DigiCard } from 'src/app/types/digi-card.types';

@Component({
  selector: 'app-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.scss'],
})
export class AuctionsComponent implements OnInit {
  static nftListCached: DigiCard[] = null;
  static cacheUntil: Date = null;
  static lastOffset: number;

  nftList: DigiCard[] = null;
  showSwitchToMatic = false;
  loading = false;
  currentOffset = 0;
  endReached = false;
  readonly limit = 12;
  nftListFiltered;
  typeFilter = 'ALL';
  filterBy = [
    { name: 'All', id: 'ALL' },
    { name: 'Price Ascending', id: 'PRICE UP' },
    { name: 'Price Descending', id: 'PRICE DOWN' },
  ];
  network;

  constructor(
    private readonly nft: NftService,
    private readonly wallet: WalletService,
    private readonly cdr: ChangeDetectorRef,
    private readonly offchain: OffchainService,
  ) {}

  async ngOnInit() {
    // this.connectMatic();
    this.network = await this.wallet.getNetwork();
    this.loadData();
    this.checkAccount();
  }

  /* connectMatic(): void{
    if (environment.testnet) {
      window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x13881',
            chainName: 'Matic Testnet',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18,
            },
            rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
          },
        ],
      });
    } else {
      window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x89',
            chainName: 'Matic',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18,
            },
            rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
          },
        ],
      });
    }
  } */

  async checkAccount(): Promise<void> {
    const account = await this.wallet.getAccount();
    this.cdr.detectChanges();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    if (
      AuctionsComponent.cacheUntil > new Date() &&
      AuctionsComponent.nftListCached
    ) {
      this.nftList = AuctionsComponent.nftListCached;
      this.currentOffset = AuctionsComponent.lastOffset;
      this.nftListFiltered = this.nftList;
      this.loading = false;
      return;
    } 

    this.nftList = [];
    this.nftListFiltered = null;
    this.currentOffset = 0;
    this.endReached = false;
    // this.nftList = await this.nft.getLastAuctions(this.limit);
    const auctionData = await this.offchain.getSaleData('auction', this.network);
    console.log(this.network, auctionData);
    auctionData.map((item) => {
      if (parseInt(item.finalPrice) === 0 && item.available && item.saleId > 0) {
        
        this.nftList.push({
          auction: true,
          auctionOrSaleData: item,
          forSale: false,
          id: item.tokenId,
          network: this.network,
          nftAddress: item.nftContractAddress,
          price: parseInt(item.minPrice)
        })
      }
    });
    console.log(this.nftList);
    /* const nftListtwo = await this.moralis.getAllTokensByContractAddressAndNetwork(environment.auctionAddressMatic, '')
    console.log(nftListtwo); */
    
    this.nftListFiltered = this.nftList;

    if (this.nftListFiltered.length === 0) {
      this.endReached = true;
    }
    this.setCache();
    this.loading = false;
    this.cdr.detectChanges();
  }

  changeFilter(): void {
    this.loading = true;

    setTimeout(async() => {
      if (this.typeFilter === 'ALL') {
        this.nftListFiltered = await this.nft.getLastAuctions(this.limit);
        this.loading = false;
        return;
      }
      if (this.typeFilter === 'PRICE UP') {
        this.nftListFiltered = this.nftList.sort((l, r) => l.price - r.price);
        this.loading = false;  
        return;
      }
      if (this.typeFilter === 'PRICE DOWN') {
        this.nftListFiltered = this.nftList.sort((l, r) => r.price - l.price);      
        this.loading = false;
        return;
      }
    }, 200);
  }

  switchToMatic(): void {
    this.wallet.switchToMatic();
  }

  async loadMore(): Promise<void> {
    this.loading = true;
    this.currentOffset = this.currentOffset + this.limit;
    const newNfts = await this.nft.getLastAuctions(
      this.limit,
      this.currentOffset
    );
  
    if (newNfts.length === 0 || newNfts.length < this.limit) {
      this.endReached = true;
    }
    this.nftList = [...this.nftList, ...newNfts];
    this.nftListFiltered = this.nftList;
    this.setCache();
    this.loading = false;
  }

  private setCache(): void {
    AuctionsComponent.nftListCached = this.nftList;
    AuctionsComponent.lastOffset = this.currentOffset;
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    AuctionsComponent.cacheUntil = date;
  }
}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { OffchainService } from 'src/app/services/offchain.service';
import { WalletService } from 'src/app/services/wallet.service';
import { Network } from 'src/app/types/network.enum';
import { DigiCard } from 'src/app/types/digi-card.types';
import { VerifiedWalletsService } from 'src/app/services/verified-wallets.service';
import { MarketplaceAndAuctionService } from 'src/app/services/marketandauction.service';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
})
export class ExplorerComponent implements OnInit {
  static nftListCached: any = null;
  static cacheUntil: Date = null;
  static lastOffset: number;
  showSwitchToEthereum;
  nftList: any = null;
  showSwitchToMatic = false;
  network: Network;

  loading = true;
  currentOffset = 0;
  readonly limit = 20;
  totalAvailableSales = 0;
  innerWidth: number;

  typeFilter = 'ALL';
  unfilteredNftList: DigiCard[] = null;
  filterBy = [
    { name: 'All', id: 'ALL' },
    { name: 'Price Ascending', id: 'PRICE UP' },
    { name: 'Price Descending', id: 'PRICE DOWN' },
  ];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly wallet: WalletService,
    private readonly offchain: OffchainService,
    private readonly verifiedWallet: VerifiedWalletsService,
    private readonly market: MarketplaceAndAuctionService,
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.innerWidth = window.innerWidth;
  }

  // TODO: Filtering in for sale. Filter by price and more.
  changeFilter(): void {
    this.loading = true;

    setTimeout(async () => {
      if (this.typeFilter === 'ALL') {
        this.nftList = this.unfilteredNftList;
        this.loading = false;
        return;
      }
      if (this.typeFilter === 'PRICE UP') {
        this.nftList = this.nftList.sort((l, r) => l.price - r.price);
        this.loading = false;
        return;
      }
      if (this.typeFilter === 'PRICE DOWN') {
        this.nftList = this.nftList.sort((l, r) => r.price - l.price);
        this.loading = false;
        return;
      }
      const filteredList = [];
      for (const nft of this.unfilteredNftList) {
        let cached = localStorage.getItem('is_physical_' + nft.id);
        if (cached === undefined) {
          cached = (await this.offchain.getNftData(nft.id, nft.network)).physical
            ? '1'
            : '0';
          localStorage.setItem('is_physical_' + nft.id, cached);
        }
        if (this.typeFilter === 'PHYSICAL') {
          if (cached === '1') {
            filteredList.push(nft);
          }
        } else {
          if (cached === '0') {
            filteredList.push(nft);
          }
        }
      }
      this.nftList = filteredList;
      this.loading = false;
    }, 200);
  }

  async checkNetwork(): Promise<void> {
    this.network = await this.wallet.getNetwork();
    this.cdr.detectChanges();
  }

  async loadData(): Promise<void> {
    await this.checkNetwork();
    if (
      ExplorerComponent.cacheUntil > new Date() &&
      ExplorerComponent.nftListCached
    ) {
      this.nftList = ExplorerComponent.nftListCached;
      this.currentOffset = ExplorerComponent.lastOffset;
      this.loading = false;
      return;
    }
    this.currentOffset = 0;
    // await this.market.getAllSalesData(this.network);
    const cards = await this.offchain.getSaleData('for-sale', this.network);
    const clist = [];
    cards.map((item) => {
      if (parseInt(item.finalPrice) === 0 && item.available && item.saleId > 0) {
        clist.push({
          auction: true,
          auctionOrSaleData: item,
          forSale: false,
          id: item.tokenId,
          network: this.network,
          nftAddress: item.nftContractAddress,
          price: item.minPrice
        })
      }
    });
    this.nftList = await this.getClassifyWithCollection(clist);
    this.loading = false;
    this.unfilteredNftList = this.nftList;
    this.setCache();
    this.cdr.detectChanges();
  }

  async getClassifyWithCollection(nftData: any): Promise<any> {
    const nftCards = [];
    for (let i = 0; i < nftData?.length; i++) {
      const owner = nftData[i].auctionOrSaleData?.owner;
      if (owner) {
        const name = await this.verifiedWallet.getWalletOwnerName(nftData[i].auctionOrSaleData.owner);
        const fItem = nftCards.findIndex((item) => item.key === name);
        if (fItem > -1) {
          nftCards[fItem].value.push(nftData[i]);
        } else {
          const value = [nftData[i]];
          const newNftItem = {
            key: name,
            value: value
          };
          nftCards.push(newNftItem)
        }
      }
    }
    return nftCards;
  }

  private setCache(): void {
    ExplorerComponent.nftListCached = this.nftList;
    ExplorerComponent.lastOffset = this.currentOffset;
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    ExplorerComponent.cacheUntil = date;
  }
}

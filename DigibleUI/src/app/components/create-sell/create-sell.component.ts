
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MarketplaceService } from '../../services/marketplace.service';
import { NftService } from '../../services/nft.service';
import { WalletService } from '../../services/wallet.service';
import { DigiCard } from '../../types/digi-card.types';
import { Network } from '../../types/network.enum';
import { MoralisService } from '../../services/moralis.service'
import { environment } from 'src/environments/environment';
// import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-sell',
  templateUrl: './create-sell.component.html',
  styleUrls: ['./create-sell.component.scss']
})
export class CreateSellComponent implements OnInit {
  network;
  showSwitchToEth;
  myCards: DigiCard[];
  showApprove = true;
  loading = false;
  address;
  account;

  constructor(
    private readonly wallet: WalletService,
    private readonly cdr: ChangeDetectorRef,
    private readonly nft: NftService,
    private readonly market: MarketplaceService,
    private readonly moralis: MoralisService,
  ) { }

  ngOnInit(): void {
    this.loadData();   
  }

  async loadData(): Promise<void> {
    this.account = await this.wallet.getAccount();
    if (!this.account) {
      return;
    }
    this.address = await this.nft.getMaticNftAddress();
    this.network = await this.wallet.getNetwork();
    this.checkApprove();
    this.loadNFTs()
  }
  async loadNFTs(): Promise<void> {
    try {
      const response = await this.moralis.getAllNFTsByWalletAddressAndNetwork(this.account, this.network);
      this.myCards = response;
    } catch (e) {
      console.error(e);
    }
  }

  async checkApprove(): Promise<void> {
    const marketPlaceAddress = await this.market.getMarketplaceAddress(this.network);
    this.showApprove = !(await this.nft.isApprovedForAll(this.account, marketPlaceAddress, this.network, environment.nftAddressMatic));
    this.cdr.detectChanges();
  }

  async approve(): Promise<void> {
    this.loading = true;
    try {
      await this.nft.setApprovalForAll(this.market.getMarketplaceAddress(this.network), this.network);
      this.checkApprove();
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
  }

  async checkNetwork(): Promise<void> {
    const network = await this.wallet.getNetwork();
    if (network !== Network.ETH) {
      this.showSwitchToEth = true;
    } else {
      this.showSwitchToEth = false;
    }
    this.cdr.detectChanges();
  }

  async switchToEth(): Promise<void> {
    await this.wallet.switchToEth();
  }
}
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OffchainService } from 'src/app/services/offchain.service';
import { VerifiedWalletsService } from 'src/app/services/verified-wallets.service';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-search',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
})
export class CollectionsComponent implements OnInit {
  isLoading: boolean = true;
  searchReady = false;
  currentOffset = 0;
  endReached = false;
  verifiedCollections = [];

  readonly limit = 10005;

  constructor(
    private readonly offchain: OffchainService,
    private readonly wallet: WalletService,
    private readonly httpclient: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.currentOffset = 0;
    this.endReached = false;
    this.getCollections();
  }

  async getCollections() {
    this.searchReady = false;
    const wallets = new VerifiedWalletsService(this.offchain, this.wallet);
    const allVerifiedWalletAddresses = await wallets.getAllVerifiedWalletAddresses();
    const verifiedCollections = [];
    allVerifiedWalletAddresses.forEach((data) => {
      wallets.getFullProfile(`${data.address}`).then((res) => {
        verifiedCollections.push(res);
      });
    });
    setTimeout( () => {
      this.verifiedCollections = verifiedCollections;
      this.loading();
    }, 100);
  }

  loading() {
    setTimeout(() => {
      this.searchReady = true;
      this.isLoading = false;
    }, 100);
  }
}

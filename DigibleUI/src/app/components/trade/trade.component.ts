import { Component, OnInit } from '@angular/core';
import { Network } from '../../types/network.enum';
import { WalletService } from '../../services/wallet.service';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss']
})
export class TradeComponent implements OnInit {
  
  collections;
  currentCollection;
  trade;



  // Network Init
  showSwitchToMatic;
 
  constructor(
    private readonly wallet: WalletService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkNetwork();
  }

  async switchToMatic() {
    await this.wallet.switchToMatic()
  }

  async checkNetwork(): Promise<void> {
    const network = await this.wallet.getNetwork();
    this.showSwitchToMatic = network !== Network.MATIC;
    this.cdr.detectChanges();
  }
}



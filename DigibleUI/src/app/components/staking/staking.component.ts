import { Component, ChangeDetectorRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Stake } from './stake.type';
import { Network } from '../../types/network.enum';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-staking',
  templateUrl: './staking.component.html',
  styleUrls: ['./staking.component.scss'],
})
export class StakingComponent {
  showSwitchToMatic;
  stakings: Stake[] = [
    {
      address: environment.maticCoinContractAddresses.digiAddressMatic,
      name: 'DIGI',
      icon: '/assets/images/logo-small.svg',
      decimals: 18,
      stakeAddress: environment.stakeAddress,
      reward: 'DIGI',
    },
  ];
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

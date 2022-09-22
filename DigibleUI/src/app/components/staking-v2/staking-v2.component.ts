import { Component, ChangeDetectorRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StakeV2 } from './stake-v2.type';
import { Network } from '../../types/network.enum';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-staking-v2',
  templateUrl: './staking-v2.component.html',
  styleUrls: ['./staking-v2.component.scss'],
})
export class StakingV2Component {
  showSwitchToMatic;
  stakings: StakeV2[] = [

    {
      // 6 Month Pool
      address: environment.maticCoinContractAddresses.digiAddressMatic,
      name: 'DIGI STAKING POOL 1',
      icon: '/assets/images/logo-small.svg',
      decimals: 18,
      stakeAddress: environment.stakev2AddressMatic1,
      reward: 'DIGI',
      apr:12,              
      poolOperStartDate: new Date("2022-1-21"),
      poolOpenEndDate: new Date("2022-1-23"),
      poolUnlockDate: new Date ("2022-7-22"),
      lockupMonths: 6,
      publicComment: "This Pool has 500,000 $DIGI CAP.",

    },

    {
      // 12 Month Pool
      address: environment.maticCoinContractAddresses.digiAddressMatic,
      name: 'DIGI STAKING POOL 2',
      icon: '/assets/images/logo-small.svg',
      decimals: 18,
      stakeAddress: environment.stakev2AddressMatic2,
      reward: 'DIGI',
      apr:22,      
      poolOperStartDate: new Date("2022-1-21"),
      poolOpenEndDate: new Date("2022-1-23"),
      poolUnlockDate: new Date ("2023-1-23"),
      lockupMonths: 12,
      publicComment: "This Pool has 1,000,000 $DIGI CAP.",
    },

    {
      // 18 Month Pool
      address: environment.maticCoinContractAddresses.digiAddressMatic,
      name: 'DIGI STAKING & REVENUE POOL',
      icon: '/assets/images/logo-small.svg',
      decimals: 18,
      stakeAddress: environment.stakev2AddressMatic3,
      reward: 'DIGI',
      apr:38,      
      poolOperStartDate: new Date("2022-1-21"),
      poolOpenEndDate: new Date("2022-1-23"),
      poolUnlockDate: new Date ("2023-7-22"),
      lockupMonths: 18,
      publicComment: "This Pool is the only pool in the series that participates in marketplace platform revenue sharing",
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

import { Component, Input, OnInit } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Stake } from 'src/app/components/staking/stake.type';
import { StakingService } from 'src/app/services/staking.service';
import { WalletService } from 'src/app/services/wallet.service';
import { Network } from 'src/app/types/network.enum';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transition:'opacity', opacity: 0}),
          animate('500ms', style({transition:'opacity', opacity: 1}))
        ]),
      ]
    )
  ],
})
export class StakeComponent implements OnInit {
  @Input()
  stake: Stake;
  errorMessage;
  address;
  approved = false;
  digiApproved = false;
  loading = false;

  amountInput;
  introDiv;
  stakeDiv;
  withdrawDiv;

  rewards;
  rewardsNumber;
  rewardsBlock;
  yourStake;
  totalStaked;
  apr;
  balance;
  calculatedApr;

  staking: StakingService;

  constructor(private readonly wallet: WalletService) {}

  ngOnInit(): void {
    this.staking = new StakingService(this.wallet, this.stake.stakeAddress);
    this.loadData();

    this.wallet.loginEvent.subscribe(() => {
      this.loadData();
    });
  }

  async loadData(): Promise<void> {
    // this.connectMatic()
    this.rewards = '...';
    this.yourStake = '...';
    this.apr = '...';
    this.balance = '...';
    this.setDivToDisplay('Intro');
    this.address = await this.wallet.getAccount();
    this.getApproved();
    this.getRewards();
    this.getYourStake();
    this.getTotalStaked();
    this.getYourBalance();
    this.getAPR();
  }

  connectMatic(): void{
    if (environment.testnet) {
      this.wallet.getProvider().request({
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
      this.wallet.getProvider().request({
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
  }

  async getYourBalance(): Promise<void> {
    this.balance = this.toFixedNoRounding(3, parseFloat(
      await this.wallet
        .getWeb3()
        .utils.fromWei(
          await this.staking.tokenBalance(this.stake.address),
          'ether'
        )
    ));
  }

  async getRewards(): Promise<void> {
    this.rewards = parseFloat(
      await this.wallet
        .getWeb3()
        .utils.fromWei(await this.staking.pendingClaim(), 'ether')
    ).toFixed(2);

    this.rewardsNumber = parseFloat(this.rewards);
  }

  async getYourStake(): Promise<void> {
    this.yourStake = parseFloat(
      await this.wallet
        .getWeb3()
        .utils.fromWei(await this.staking.getStakedAmount(), 'ether')
    ).toFixed(2);
  }

  async getTotalStaked(): Promise<void> {
    this.totalStaked = parseFloat(
      await this.wallet
        .getWeb3()
        .utils.fromWei(await this.staking.getTotalStakeForStake(), 'ether')
    ).toFixed(2);
  }

  async getApproved(): Promise<void> {
    this.approved = await this.staking.allowed(this.stake.address, 1);
  }

  async approveDigi(): Promise<void> {
    this.send(() => this.staking.approveToken(environment.maticCoinContractAddresses.digiAddressMatic));
  }

  async claim(): Promise<void> {
    this.send(() => this.staking.claim());
  }

  async withdraw(): Promise<void> {
    this.send(async () => this.staking.withdraw());
  }

  async deposit(): Promise<void> {
    if (!this.amountInput) {
      this.errorMessage = 'Please enter an amount greater than 0.'
      return;
    }
    this.send(() =>
      this.staking.deposit(
        this.wallet.getWeb3().utils.toWei(this.amountInput + '', 'ether')
      )
    );
  }

  async getAPR(): Promise<void> {
    const getTotalStake = parseFloat(
      await this.wallet
        .getWeb3()
        .utils.fromWei(await this.staking.getTotalStakeForStake(), 'ether')
    );
    if (getTotalStake === 0) {
      this.apr = 0;
      return;
    }

    const blocksIn12Months = 10475500;
    this.apr = (getTotalStake * 100).toFixed(0);
  }

  private async send(method: () => Promise<any>): Promise<void> {
    if ((await this.wallet.getNetwork()) !== Network.MATIC) {
      this.switchToMatic();
      return;
    }

    this.loading = true;
    try {
      await method();
      this.loadData();
    } catch (e) {
      // console.log(e.message);
      this.errorMessage = e.message
      this.calculatedApr = '0'
      this.amountInput = 0
      console.error(e);
    }
    this.loading = false;
  }

  calculateApr(event: KeyboardEvent): void {
    this.calculatedApr = ((8 / 100) * parseInt((<HTMLInputElement>event.target).value, 10)).toLocaleString();
    this.amountInput = (<HTMLInputElement>event.target).value
  }

  setDivToDisplay(div) {
    if(div === 'Intro'){
      this.introDiv = true;
      this.stakeDiv = false;
      this.withdrawDiv = false;
    } else if(div === 'Start Staking') {
      this.stakeDiv = true;
      this.introDiv = false;
      this.withdrawDiv = false;
    } else if(div === 'Withdraw') {
      this.stakeDiv = false;
      this.introDiv = false;
      this.withdrawDiv = true;
    }
  }

  switchToMatic(): void {
    this.wallet.switchToMatic();
  }

  public toFixedNoRounding(n:any, d: any) {
    const reg = new RegExp(`^-?\\d+(?:\\.\\d{0,${n}})?`, 'g')
    const a = d.toString().match(reg)[0];
    const dot = a.indexOf('.');
  
    if (dot === -1) {
      return a + '.' + '0'.repeat(n);
    }
  
    const b = n - (a.length - dot) + 1;
  
    return b > 0 ? (a + '0'.repeat(b)) : a;
  }
}

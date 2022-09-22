import { Component, Input, OnInit } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { StakeV2 } from 'src/app/components/staking-v2/stake-v2.type';
import { StakingServiceV2 } from 'src/app/services/staking-v2.service';
import { WalletService } from 'src/app/services/wallet.service';
import { Network } from 'src/app/types/network.enum';
import { environment } from 'src/environments/environment';
import { Key } from 'protractor';
import { stringify } from 'querystring';
import { max } from 'moment';

@Component({
  selector: 'app-stake-v2',
  templateUrl: './stake-v2.component.html',
  styleUrls: ['./stake-v2.component.scss'],
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
export class StakeV2Component implements OnInit {
  @Input()
  stakeV2: StakeV2;
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
  
  balance;
 

  
  entryFee_bps;
  cap; 
  gotFee;
  maxStake;
  expectedReward;
  calculatedApr;
  calculatedNetStakeAfterFee;

  staking: StakingServiceV2;

  constructor(private readonly wallet: WalletService) {}

  ngOnInit(): void {
    console.log(this.stakeV2);
    this.staking = new StakingServiceV2(this.wallet, this.stakeV2.stakeAddress);
    this.loadData();

    this.wallet.loginEvent.subscribe(() => {
      this.loadData();
    });
  }

  async loadData(): Promise<void> {
    // this.connectMatic()
    this.rewards = '...';
    this.yourStake = '...';  
    this.balance = '...';
    
    this.setDivToDisplay('Intro');
    this.address = await this.wallet.getAccount();
    this.getApproved();
   
    this.getYourStake();
    this.getTotalStakedEveryone();
    this.getYourBalance();
   
    this.getEntryFee_bps();
   
 
   

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
          await this.staking.tokenBalance(this.stakeV2.address),
          'ether'
        )
    ));
  }



  async getYourStake(): Promise<void> {
    this.yourStake = parseFloat(
      await this.wallet
        .getWeb3()
        .utils.fromWei(await this.staking.getStakedAmount(), 'ether')
    ).toFixed(2);
    this.expectedReward  = this.yourStake * this.stakeV2.lockupMonths * this.stakeV2.apr / 12
    console.log("Exp Reward:" + this.expectedReward);
  }

  async getTotalStakedEveryone(): Promise<void> {
    this.totalStaked = parseFloat(
      await this.wallet
        .getWeb3()
        .utils.fromWei(await this.staking.getTotalStakedAmountEveryone(), 'ether')
    ).toFixed(0);   

    
    this.cap = parseFloat(
      await this.wallet
        .getWeb3()
        .utils.fromWei(await this.staking.getStakeCap(), 'ether')
    ).toFixed(0); 
    
   
    this.getMaxStakeSize();
    console.log("Total Staked" + this.totalStaked + " MaxSize " + this.maxStake);
    
  
  }



 


  async getApproved(): Promise<void> {
    this.approved = await this.staking.allowed(this.stakeV2.address, 1);
  }

  async approveDigi(): Promise<void> {
    this.send(() => this.staking.approveToken(environment.maticCoinContractAddresses.digiAddressMatic));
  }



  async withdraw(): Promise<void> {
    this.send(async () => this.staking.withdraw());
  }

  async deposit(): Promise<void> {
    if (!this.amountInput) {
      this.errorMessage = 'Please enter an amount greater than 0.'
      return;
    }
    if(this.amountInput > this.maxStake){
      this.errorMessage = 'Deposit amount exceeds Cap limit. Remaining: ' + this.maxStake;
      return;
    }

    this.send(() =>
      this.staking.deposit(
        this.wallet.getWeb3().utils.toWei(this.calculatedNetStakeAfterFee + '', 'ether')
      )
    );
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
      console.log(e.message);
      this.errorMessage = e.message
    
      this.amountInput = 0
      console.error(e);
    }
    this.loading = false;
  }


  async getEntryFee_bps(): Promise<void> {
    this.entryFee_bps = await this.staking.getEntryFee_bps();
    
  }

  async getMaxStakeSize() {  
    
    this.maxStake = this.cap - this.totalStaked;  
   
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

  // @ dev Calculations based on user input

  calculate(event: KeyboardEvent): void {

    this.calculateApr(event);
    this.calculateNet(event);
  }
  calculateApr(event: KeyboardEvent): void {
    this.calculatedApr = ((this.stakeV2.apr / 100 / 12 ) * this.stakeV2.lockupMonths * parseInt((<HTMLInputElement>event.target).value, 10)).toLocaleString();
    this.amountInput = (<HTMLInputElement>event.target).value

  }

  calculateNet(event: KeyboardEvent): void {
    var _amount = parseInt((<HTMLInputElement>event.target).value, 10); 
    this.calculatedNetStakeAfterFee = Math.round(_amount / (1 - this.entryFee_bps/10000) * 100) / 100; 
    this.amountInput = (<HTMLInputElement>event.target).value
  }



  // setCapWidth(){

  //   var w = 100 - ((this.totalStaked / this.cap) * 100);
  //   console.log(this.totalStaked + "/" + this.cap);
  //   if(isNaN(w)){
  //     w = 100;
  //     console.log(this.totalStaked / this.cap + "%");
  //   }
  //   console.log(w + "%")
  //   document.getElementById("progress-bar1").style["width"] = w + "%";
  //   document.getElementById("progress-bar1").innerHTML = this.totalStaked + "/" + this.cap;
   
 
  // }

 
  

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

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavigationStart, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NftService } from '../services/nft.service';
import { WalletService } from '../services/wallet.service';
import { MoralisService } from '../services/moralis.service';
import { BrowserService } from '../services/browser.service';
import { Network } from '../types/network.enum';
import { DigiCard } from 'src/app/types/digi-card.types';
import { OffchainService } from 'src/app/services/offchain.service';
import { Event } from '@angular/router';
import { NgForm } from '@angular/forms';
import { SubscribeService } from 'src/app/services/subscribe.service';
import { $ } from 'protractor';

const innerHeight = require('ios-inner-height');

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => active', [
        style({ opacity: 0 }),
        animate(10000, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class LayoutComponent implements OnInit {
  currentUser;
  subscribeData: any = <any>{};
  nftList: DigiCard[] = null;
  unfilteredNftList: DigiCard[] = null;
  address;
  routeName;
  showAlertMessage;
  network;
  currentTime;
  inputNftName;
  hideNetwork = false;
  mobileNavIcon = null;
  hideCreateButton = false;
  testnet = environment.testnet;
  isMenuOpened: boolean | null = null;
  newest = false;
  readonly limit = 12;
  popUp = true;
  autocompleteList: Array<object> = [];
  keyword = 'name';
  isMetamaskUnVisible = false;
  chainDropdown: boolean = false;
  chainList: object = {
    // 'Ethereum' :"/assets/images/networks/ethereum.svg",
    'Matic' :"/assets/images/networks/polygon.png",
    'Binance' :"/assets/images/networks/binance.png",
  }

  constructor(
    private readonly walletService: WalletService,
    private readonly moralis: MoralisService,
    private readonly cdr: ChangeDetectorRef,
    private readonly nft: NftService,
    public router: Router,
    private readonly offchain: OffchainService,
    private subscribeService: SubscribeService
  ) {}

  ngOnInit(): void {
    this.setAddress();
    this.walletService.getNetwork();
    this.toggleTheme();
    this.applyHeaderClass();
    this.loadData();
    window.onscroll = () => {
      this.applyHeaderClass();
    };
    this.checkWalletNetwork();
    this.currentTime = new Date().toLocaleString();
    if (window.innerWidth < 500) {
      this.isMenuOpened = false;
    }
    this.listenNetworkChange();

    this.isMetamaskUnVisible = BrowserService.isMetamaskUnvisible();
  }

  // customFilter(autocompleteList: any[], query: string): any[] {
  //   return autocompleteList.filter(x => x.name.toLowerCase().startsWith(query.toLowerCase())) || autocompleteList.filter(x => x.description.toLowerCase().startsWith(query.toLowerCase()));
  // }

  public async setAddress() {
    let account;
   
    if (window.ethereum) {
      account = await window.ethereum.request({ method: 'eth_accounts' });
    } else {
      let lastSavedWalletconnectInstance = localStorage.getItem('walletconnetProvider');
      if (lastSavedWalletconnectInstance !== null) {
        let lastwallet = JSON.parse(lastSavedWalletconnectInstance);
        await this.walletService.initWeb3(lastwallet);
        account = lastwallet['accounts'];
      } else {
        account = await this.walletService.web3.eth.getAccounts();
      }
    }
    if (!account)  return;
    this.address = account[0];
  }

  selectEvent(e) {}

  onChangeSearch(e) {}

  onFocused(e) {}
  showPopUp() {
    const hasDisplayed = localStorage.getItem('popUpLoadedBefore');
    if (!hasDisplayed) {
      localStorage.setItem('popUpLoadedBefore', 'true');
      this.popUp = true;
    } else {
      this.popUp = false;
    }
  }

  changeOfRoutes() {
    this.routeName = this.router.url
      .replace(/^\/+/g, '')
      .replace(/-/g, ' ')
      .split('/')[0]
      .split('?')[0];
  }

  toggleChainDropdown(nValue) {
    this.chainDropdown = nValue;
  }

  switchNetwork(target) {
    if (target === 'Ethereum') {
      this.walletService.switchToEth();
    } else if (target === 'Matic') {
      this.walletService.switchToMatic();
    } else if (target === 'Binance') {
      this.walletService.switchToBinance();
    }
  }

  subscribe(subscribeForm: NgForm) {
    if (subscribeForm.invalid) {
      return;
    }
    this.subscribeService.subscribeToList(this.subscribeData).subscribe(
      (res) => {
        alert('Subscribed!');
      },
      (err) => {
        console.log(err);
      }
    );
  }

  async checkWalletNetwork(): Promise<void> {
    this.walletService.getNetwork().then((network: Network) => {
      if (network === Network.ETH) {
        this.network = 'Ethereum';
      } else if (network === Network.MATIC) {
        this.network = 'Matic';
      } else if (network === Network.BSC) {
        this.network = 'Binance';
      } else {
        this.network = 'Invalid';
      }
      this.cdr.detectChanges();
    });
  }

  async listenNetworkChange() {
    await this.walletService.provider.enable();
		// Subscribe to chainId change
		this.walletService.provider.on("chainChanged", () => {
			this.checkWalletNetwork();
		});
  }

  async loadData(): Promise<void> {
    // this.nftList = await this.nft.getNewNfts(100, 0);
    // console.log("NFT list ====>", this.nftList);
    // this.unfilteredNftList = this.nftList;
    let autocomplete = localStorage.getItem("autocomplete");
    if (autocomplete === null) {
      const maticNTFs = await this.moralis.getAllTokensByContractAddressAndNetwork(environment.nftAddressMatic, 'MATIC')
      const digiCubes = await this.moralis.getAllTokensByContractAddressAndNetwork(environment.nftCubesAddressMatic, 'MATIC')
      const digiKeys = await this.moralis.getAllTokensByContractAddressAndNetwork(environment.nftKeysAddressMatic, 'MATIC')
      this.nftList = [...maticNTFs, ...digiCubes, ...digiKeys].sort(() => Math.random() - 0.5);
      this.getAutocompleteData(this.nftList);
    } else {
      this.autocompleteList = JSON.parse(autocomplete);
    }

  }

  getAutocompleteData(list: any[]): void {
    let data: object[] = [];
    list.map((item, index) => {
      data.push({
        token_address: item.token_address,
        token_name: item.name,
        name: item.tokenData.name,
        description: item.tokenData.description,
        image: item.tokenData.image,
        token_id: item.token_id
      })
    });
    localStorage.setItem("autocomplete", JSON.stringify(data));
    this.autocompleteList = data;
  }

  onChangeInput(): void {
    // ToDo: Do anithing with the input data (this.inputNftName);
  }

  toggleMenu(): void {
    this.isMenuOpened = !this.isMenuOpened;
  }

  closeModal(){
    document.getElementById('walletModalCloseBtn').click();
  }

  async connectWallet(provider): Promise<void> {
    document.getElementById('walletModalCloseBtn').click();
    this.address = await this.moralis.connectWallet(provider);
  }

  findResult(e) {
    const inputValue = (
      document.getElementById('searchInp') as HTMLInputElement
    ).value;
    if (inputValue === '') {
      return;
    }
    if (e.code === 'Enter' || e.type == 'click') {
      document.location.href = '/search?search=' + inputValue;
    }
  }

  /* findMobileResult(e) {
    const mobInpValue = (
      document.getElementById('searchInpMob') as HTMLInputElement
    ).value;
    document.location.href = '/search?search=' + mobInpValue;
  } */

  isIos() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }

  iosBarNavFix() {
    /* if(('standalone' in window.navigator) && (window.navigator.standalone)) {
      return
    } */
    if (innerHeight() > window.innerHeight) {
      // iOS bottom bar is present
      document.body.classList.add('ios-bar--active');
    } else {
      // iOS bottom bar is NOT present so show footer
      document.body.classList.remove('ios-bar--active');
    }
  }

  mobileMenuToggle() {
    const body = document.body;
    const mq = window.matchMedia('(max-width: 1023px)');

    if (!mq.matches) {
      return;
    }

    if (body.classList.contains('c-mobile__nav--active')) {
      body.classList.remove('c-mobile__nav--active');
      body.classList.add('c-mobile__nav--in-active');
    } else {
      body.classList.add('c-mobile__nav--active');
      body.classList.remove('c-mobile__nav--in-active');
    }
  }

  applyHeaderClass() {
    const body = document.body;
    if (body.scrollTop > 120 || document.documentElement.scrollTop > 120) {
      if (!body.classList.contains('c-header--active')) {
        body.classList.add('c-header--active');
      }
    } else {
      body.classList.remove('c-header--active');
    }
  }

  toggleTheme() {
    const toggleSwitch = document.querySelector(
      '.theme-switch input[type="checkbox"]'
    ) as HTMLInputElement;
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
      document.body.classList.add(`${currentTheme}-mode`);

      if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
      }
    }

    function switchTheme(e) {
      if (e.target.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    }
    toggleSwitch.addEventListener('change', switchTheme, false);
  }
}

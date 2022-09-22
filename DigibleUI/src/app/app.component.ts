import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
	ViewChild,
} from '@angular/core';
import { Moralis } from 'moralis';
import { environment } from 'src/environments/environment';
import { WalletService } from 'src/app/services/wallet.service';
import { BrowserService } from 'src/app/services/browser.service';
import { User } from './user.component';
// import { LayoutComponent } from './layout/layout.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	//changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
	static myapp;
	title = 'Digible dApp';
	user?: User;
	address?: string;
	error_message: string;
	showAlertMessage: boolean = false;
	showConnectMatic: boolean = false;
	noProvider: boolean = false;
	private _layoutComponent;
	// @ViewChild(LayoutComponent) 
	constructor(
		private cdr: ChangeDetectorRef,
		private readonly wallet: WalletService
	) {}

	onActivate (componentRef) {
		this._layoutComponent = componentRef;
	}

	ngOnInit(): void {
		this.wallet.init();
		this.checkIfWalletConnected();
		this.setMoralisWalletEvents();

		const isSupported = () =>
			'Notification' in window &&
			'serviceWorker' in navigator &&
			'PushManager' in window;

		AppComponent.myapp = this;
		if (isSupported()) {
			const hasPermission = Notification.requestPermission();
		}
	}
	async getCurrentUser(): Promise<any> {
		const user: any = await Moralis.User.current();
		return user;
	}

	setMoralisWalletEvents() {
		Moralis.start({
			appId: environment.moralis.appId,
			serverUrl: environment.moralis.serverUrl,
		})
		.then(() => console.log('Moralis has been initialised.'))
		.finally(() => {
			//this.setLoggedInUser(Moralis.User.current())
		});

		Moralis.onAccountChanged(([account]) => {
			this.getCurrentUser().then(async (user) => {
				if (user && account.length === 0) {
					this.logout();
				}
				if (user && user.attributes.accounts.includes(account)) {
					return window.location.reload();
				} else {
					const confirmed = confirm('Link this address to your account?');
					if (confirmed) {
						try {
							const user = await Moralis.link(account);
						} catch (e) {
							this.showAlertMessage = true;
							this.error_message = e.message;
							return;
						}
					}
				}
			});
		});

		Moralis.onChainChanged((accounts) => {
			window.location.reload();
		});

		Moralis.onDisconnect((accounts) => {
			alert("logout");
			this.logout();
		});
	}

	async checkIfWalletConnected() {
		// let accounts;
		// let networkId;
		// if (window.ethereum) {
		// 	accounts = await window.ethereum.request({ method: 'eth_accounts' });
		// 	networkId = await this.wallet.getWeb3().eth.net.getId();
		// } else {
		// 	let lastSavedWalletconnectInstance = localStorage.getItem('walletconnect');
		// 	if (lastSavedWalletconnectInstance !== null) {
		// 		let lastwallet = JSON.parse(lastSavedWalletconnectInstance);
		// 		accounts = lastwallet['accounts'];
		// 		networkId = lastwallet['chainId'];
		// 	} else {
		// 		accounts = await this.wallet.web3.eth.getAccounts();
		// 		networkId = await this.wallet.web3.eth.net.getId();
		// 	}
		// }
		const accounts = await this.wallet.web3.eth.getAccounts();
	  const networkId = await this.wallet.web3.eth.net.getId();
		if(!!networkId){
			if(!environment.testnet && networkId !== 137 && await this.wallet.getNetwork() != "BSC") {
				this.showConnectMatic = true
				this.showAlertMessage = true;
				this.error_message = ' ';
			} 
			
			if(environment.testnet && networkId !== 80001 && await this.wallet.getNetwork() != "BSC") {
				this.showConnectMatic = true
				this.showAlertMessage = true;
				this.error_message = ' ';
			}
			if (accounts && accounts.length > 0 && !Moralis.User.current()) {
				if (window.ethereum) {
					this.login('metamask');
				} else {
					this.login('walletconnect');
				}
			}
		}
	}

	async connectMatic() {
		await this.wallet.switchToMatic();
	}

	async login(provider) {
		if (provider == 'metamask') {
			try {
				await this.wallet.enableWeb3();
				const user = await Moralis.authenticate();
				this.setLoggedInUser(user);
				window.location.reload();
			} catch(e) {
				this.showAlertMessage = true;
				this.error_message = e.message;
			}
		} else {
			try {
				await this.wallet.enableWeb3();
				const user = await Moralis.authenticate({provider: 'walletconnect'});
				this.setLoggedInUser(user);
				let walletProvider = JSON.stringify(this.wallet.provider);
				console.log("+++++++++++++  set storage login ++++++++");
				console.log(walletProvider);
				localStorage.setItem('walletconnetProvider', walletProvider);
				let repeat = localStorage.getItem('walletconnetProvider');
				console.log(repeat);
				console.log("++++++++++++++ end +++++++++++++++++");
			} catch(e) {
				this.showAlertMessage = true;
				this.error_message = e.message;
			}
		}
	}

	closeErrorBanner() {
		this.showAlertMessage = false;
	}

	logout() {
		Moralis.User.logOut()
			.then((loggedOutUser) => console.info('logout', loggedOutUser))
			// Set user to undefined
			.then(() => {
				localStorage.removeItem('walletconnetProvider');
				this.setLoggedInUser(undefined)
			})
			// Disconnect Web3 wallet
			.then(() => Moralis.cleanup())
			.then((loggedInUser) => {
				window.location.reload();
			})
			.catch((e) => {
				this.showAlertMessage = true;
				this.error_message = e.message;
			});
	}

	private async setLoggedInUser(loggedInUser?: User) {
		this.user = loggedInUser;
		if (loggedInUser) {
			this._layoutComponent.setAddress();
			this.address = this._layoutComponent.address;
		}
		console.info('Loggedin user:', loggedInUser);
		/**
		 * Manual detect changes due to OnPush change detection.
		 * This can be eliminated if you use async pipe and Observables
		 * (out of scope of this demo)
		 */
		this.cdr.detectChanges();
	}
}

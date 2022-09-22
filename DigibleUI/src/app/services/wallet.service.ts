import { EventEmitter, Injectable, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import Web3 from 'web3';
import { OffchainService } from '../services/offchain.service';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers';
import { AbstractProvider } from 'web3-core/types'

export declare class WalletConnectWeb3Provider extends WalletConnectProvider implements AbstractProvider {
	sendAsync(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void;
}

declare global {
	interface Window {
		ethereum: any;
	}
}

@Injectable({
	providedIn: 'root',
})
export class WalletService {
	MAX_INT = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
	web3;
	web3Infura; // are you sure this is infura? probably Moralis
	web3InfuraMatic; // are you sure this is infura? probably Moralis
	web3MoralisBSC;
	provider;
	digiTokenAddress = '0x3cbf23c081faa5419810ce0f6bc1ecb73006d848';
	digiPublicSaleAddress = '0xabe5df074162904842e899a9119e72baef04c64d';
	
	supportedNetworks = ['MATIC', 'BSC'];
	network = null;
	accounts = null;

	constructor( 
		public offchain: OffchainService				
		) {
		this.init();
	}

	@Output() loginEvent = new EventEmitter<void>();

	init(): void {
		if (window.ethereum) {
			this.provider = window.ethereum;//window['ethereum'];
			this.web3 = new Web3(window.ethereum);
			return;
		} else {
			const provider = new WalletConnectProvider({
				rpc: {
					80001: 'https://rpc-mumbai.maticvigil.com/',
					137: 'https://rpc-mainnet.maticvigil.com/'
				},
				bridge:"https://bridge.walletconnect.org"
			});
			this.provider = provider;
			this.web3 = new Web3(provider as WalletConnectWeb3Provider);
			
		}
		
	}

	async initWeb3(provider: any): Promise<void> {
		this.provider = provider;
		this.web3 = new Web3(provider as WalletConnectWeb3Provider);
		return;
	}

	async enableWeb3(): Promise<void> {
		await this.provider.enable();
		// Subscribe to accounts change
		this.provider.on("accountsChanged", (accounts: string[]) => {
			console.log(accounts);
			this.accounts = null;
		});

		// Subscribe to chainId change
		this.provider.on("chainChanged", (chainId: number) => {
			this.network = null;
			console.log(chainId);
		});

		// Subscribe to session disconnection
		this.provider.on("disconnect", (code: number, reason: string) => {
			console.log("==== walletconnect disconnect ====");
			console.log(code, reason);
			localStorage.removeItem('walletconnet');
		});
		return;
	}

	async getTokenBalance(token: string, network?: string): Promise<number> {
		if(!network){
			network = await this.getNetwork();
		}
		console.log(token, network, 'gettokenbal');
		const account = await this.getAccount();
	
		const erc20Abi = require('../../assets/abis/erc20.json');
		const abiJson = [
			{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
		];
		const erc20Token = new (this.getWeb3().eth.Contract)(abiJson, token);
		console.log("Getting Balance ",  token, " of Account ", account);
		try {
			var r =  await erc20Token.methods.balanceOf(account).call();
			console.log("Balance ", r, token);
		} catch (error) {
			console.log("error getting balance for", account, token, network, error);
			return 0;
			
		}
	
		return r;
	}

	async tokenBalance(token: string): Promise<number> {
		const account = await this.getAccount();
	
		const erc20Abi = require('../../assets/abis/erc20.json');
		const erc20Token = new (this.getWeb3().eth.Contract)(erc20Abi, token);
		console.log("Getting Balance ",  token, " of Account ", account);
		var r =  await erc20Token.methods.balanceOf(account).call();
		console.log("Balance ", r, token);
		return r;
	}

	getWeb3(): any {
		return this.web3;
	}

	getProvider(): any {
		return this.provider;
	}

	// #######################
	// NETWORKS ADD HERE
	async getNetwork(): Promise<any> {
		if (this.network) return this.network;
		this.network = await this.getWeb3().eth.net.getId().then((res)=> {
			if (!environment.testnet) {
				if(res === 1) return 'ETH';
				if(res === 137) return 'MATIC';
				if(res === 56) return 'BSC';
			} else {
				if(res === 5) return 'ETH';
				if(res === 80001) return 'MATIC';
				if(res === 97) return 'BSC';
			}
			
			return 'UNSUPPORTED';
		});
		return this.network;
	}
	
	getWeb3ByNetwork(network: string):any{
		console.log(network, 'getWeb3ByNetwork');
		if (network == 'ETH') {
			return this.getInfuraWeb3();
		}
		else if(network == 'BSC'){
			return this.getBSCWeb3();
		} 
		else if (network == 'MATIC') {		
			return this.getMaticInfuraWeb3()
		}
	}

	getBSCWeb3(): any {
		if (!this.web3MoralisBSC) {
			let prefix = 'mainnet';
			if (environment.testnet) {
				prefix = 'testnet';
			}
			
			this.web3MoralisBSC = new Web3(
				new Web3.providers.HttpProvider(
					`https://speedy-nodes-nyc.moralis.io/${environment.moralisId}/bsc/${prefix}`
				)
			);
		}
		return this.web3MoralisBSC;
	}

	getMaticInfuraWeb3(): any {
		if (!this.web3InfuraMatic) {
			let prefix = 'mainnet';
			if (environment.testnet) {
				prefix = 'mumbai';
			}
			
			this.web3InfuraMatic = new Web3(
				new Web3.providers.HttpProvider(
					`https://speedy-nodes-nyc.moralis.io/${environment.moralisId}/polygon/${prefix}`
				)
			);
		}
		return this.web3InfuraMatic;
	}

	getInfuraWeb3(): any {
		if (!this.web3Infura) {
			let prefix = 'mainnet';
			if (environment.testnet) {
				prefix = 'kovan';
			}
			this.web3Infura = new Web3(
				new Web3.providers.HttpProvider(
					`https://speedy-nodes-nyc.moralis.io/${environment.moralisId}/eth/${prefix}`
				)
			);
		}
		return this.web3Infura;
	}

	async signMessage(message: string): Promise<string> {
		return await this.getWeb3().eth.personal.sign(
			this.getWeb3().utils.fromUtf8(message),
			await this.getAccount()
		);
	}

	async switchToMatic(): Promise<void> {
		if (environment.testnet) {
			await this.provider.request({
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
			await this.provider.request({
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

	async switchToEth(): Promise<void> {
		if (environment.testnet) {
			await this.provider.request({
				method: 'wallet_switchEthereumChain',
				params: [
					{
						chainId: '0x5',
					},
				],
			});
		} else {
			await this.provider.request({
				method: 'wallet_switchEthereumChain',
				params: [
					{
						chainId: '0x1',
					},
				],
			});
		}
	}

	async switchToBinance(): Promise<void> {
		if (environment.testnet) {
			await this.provider.request({
				method: 'wallet_addEthereumChain',
				params: [
					{
						chainId: '0x61',
						chainName: 'BSC Testnet',
						nativeCurrency: {
							name: 'BNB',
							symbol: 'BNB',
							decimals: 18,
						},
						rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
						blockExplorerUrls: ['https://explorer.binance.org/smart-testnet']
					},
				],
			});
		} else {
			await this.provider.request({
				method: 'wallet_addEthereumChain',
				params: [
					{
						chainId: '0x38',
						chainName: 'Binance Smart Chain',
						nativeCurrency: {
							name: 'BNB',
							symbol: 'BNB',
							decimals: 18,
						},
						rpcUrls: ['https://bsc-dataseed.binance.org/'],
						blockExplorerUrls: ['https://bscscan.com']
					},
				],
			});
		}
	}

	async getBalance(account?: string): Promise<string> {
		if (!account) {
			account = await this.getAccount();
		}
		const data = await this.getWeb3().eth.getBalance(account);
		return this.web3.utils.fromWei(data, 'ether');
	}

	async getAccount(): Promise<string | null> {
		if (!this.web3)  return null;
		if (this.accounts != null) return this.accounts;
		const accounts = await this.getWeb3().eth.getAccounts();

		if (accounts.length === 0)  return null;
		this.accounts = accounts[0];
		return accounts[0];
	}

	async connectWithMetamask() {
		// let ethereum = window['ethereum'];
		// if (typeof ethereum !== 'undefined') {
		//   console.log('MetaMask is installed!');
		// }
		// this.web3 = new Web3(window.ethereum);
		// if (ethereum) {
		//   this.provider = ethereum;
		//   try {
		//     // Request account access
		//     return new Promise((resolve, reject) => {
		//       ethereum
		//         .request({ method: 'eth_requestAccounts' })
		//         .then((address: any) => {
		//           if (address !== null) {
		//             resolve(address[0]);
		//           }
		//         });
		//     });
		//   } catch (error) {
		//     // User denied account access...
		//     console.error('User denied account access');
		//   }
		// }
		try {
			// Request account access
			return new Promise((resolve, reject) => {
				this.getProvider()
					.request({ method: 'eth_requestAccounts' })
					.then((address: any) => {
						if (address !== null) {
							resolve(address[0]);
						}
					});
			});
		} catch (error) {
			// User denied account access...
			console.error('User denied account access');
		}
	}

	async getFullProfile(address: string): Promise<any> {

		address = this.web3.utils.toChecksumAddress(address)
		return new Promise(async (resolve, reject) => {
			await this.offchain
				.getProfileData(address)
				.then((response) => {
					resolve(response);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	// Add generated userCode to this information
	async updProfileData(
		address: string,
		profileImage: string,
		heroImage: string,
		username: string,
		description: string,
		twitter: string,
		instagram: string,
		email: string,
		twitch: string,
		tiktok: string
	) {
		const ipfs = await this.offchain.updProfile(
			this.getWeb3().utils.toChecksumAddress(address),
			profileImage,
			heroImage,
			username,
			description,
			twitter,
			instagram,
			email,
			tiktok,
			twitch
		);
		return ipfs['status'] == 'success';
	}

    //##################
	// ERC20 APPROVAL FUNCTIONS

	async approveSpendErc20(
		spenderAddress: string,
		network: string,
		currencyToApprove: string
	  ): Promise<void> {
		const account = await this.getAccount();
		await (await this.getCurrencyContract(currencyToApprove, network, false)).methods
		  .approve(spenderAddress, this.MAX_INT)
		  .send({ from: account });
	  }

	 

	
	  async checkApprovalToSpendErc20(
		spenderAddress: string,
		network: string,
		currency: string
	  ): Promise<number> {
		const account = await this.getAccount();
		const contract = await this.getCurrencyContract(currency, network, false);
		console.log("Checking Approval to spend ERC20 by", spenderAddress, network, currency);
		return await contract.methods.allowance(account, spenderAddress).call();
	  }

	//##################
	// ERC721 APPROVAL FUNCTIONS

	  async approveAllErc721(
		nftAddress: string,
		operator: string
	  ): Promise<void> {
		const abi = require('../../assets/abis/erc721.json');
		const nft = new (this.getWeb3().eth.Contract)(abi, nftAddress);
		await nft.methods
		  .setApprovalForAll(operator, true)
		  .send({ from: await this.getAccount() });
	  }
	
	

	  async checkApprovalToSpendErc721(
		nftAddress: string,
		owner: string,
		operator: string
	  ): Promise<boolean> {
		const abi = require('../../assets/abis/erc721.json');
		const nft = new (this.getWeb3().eth.Contract)(abi, nftAddress);
		return await nft.methods.isApprovedForAll(owner, operator).call();
	  }



	  async getCurrencyContract(
		currency: string,
		network: string,
		readonly?: boolean
	  ): Promise<any> {
		
		const abi = require('../../assets/abis/erc20.json');
		if (readonly) {
		 
			return new (this.getWeb3ByNetwork(network).eth.Contract)(
			  abi,
			  currency
			);		  
		
		} else {
		  return new (this.getWeb3().eth.Contract)(abi, currency);
		}
	  }

	  public async getERC721ContractByAddressAndNetwork(
		tokenAddress: string,
		network: string
	  ): Promise<any> {
		const abi = require('../../assets/abis/erc721.json');
		return new (this.getWeb3().eth.Contract)(abi, tokenAddress);
	  }
	

}

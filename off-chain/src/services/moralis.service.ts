import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { create, all } from 'mathjs';
import { Sale } from 'src/dtos/sale.dto';

const config:any = {
  number: 'BigNumber',
  precision: 64,
}
export const math = create(all, config);
const MARKETPLACE_AUCTION_MATIC = {
	TESTNET: '0x32399ED9f644B148D671Eda08c153080Ae3B0B2e',
	MAINNET: '0x2179F8F3763a88A3801EA85C3C84A8a9aA17ea81'
}

const MARKETPLACE_AUCTION_BSC = {
	TESTNET: '0xd3CecAE082A5cEF1b7BB2FA285A9AB81b0429f4d',
	MAINNET: '0xC0ED4B06A1d0b9d1e245445dF689Cb1368b385E6'
}

@Injectable()
export class MoralisService {

	private Moralis = require('moralis/node');
	
	constructor() {
		this.Moralis.start({
			serverUrl: process.env.SERVER_URL,
			appId: process.env.APP_ID,
			masterKey: process.env.MASTERKEY
		});
	}

	private getChainValue(testnetAddress, mainnetAddress) {
		if (process.env.TESTNET === '1') return testnetAddress;
		return mainnetAddress;
	}
	
	async getMarketplaceContract(network = 'MATIC'): Promise<any> {
		const abi = require("../../../abis/digimarketandauction.json");
		const web3 = this.getWeb3ByNetwork(network);
		let contractAddress;
		if (network == 'MATIC') contractAddress = this.getChainValue(MARKETPLACE_AUCTION_MATIC.TESTNET, MARKETPLACE_AUCTION_MATIC.MAINNET);
		else if (network == 'BSC') contractAddress = this.getChainValue(MARKETPLACE_AUCTION_BSC.TESTNET, MARKETPLACE_AUCTION_BSC.MAINNET);
		return new web3.eth.Contract(abi, contractAddress);
	}

	getWeb3ByNetwork(network: string):any{
		if(network == 'BSC'){
			return this.getBSCWeb3();
		} 
		else if (network == 'MATIC') {		
			return this.getMaticInfuraWeb3()
		}
	}

	getBSCWeb3(): any {
		let prefix = this.getChainValue('testnet', 'mainnet');
		const Web3 = require('web3');
		
		return new Web3(
			new Web3.providers.HttpProvider(
				`https://speedy-nodes-nyc.moralis.io/${process.env.MORALISID}/bsc/${prefix}`
			)
		);
	}

	getMaticInfuraWeb3(): any {
		let prefix = this.getChainValue('mumbai', 'mainnet');
		const Web3 = require('web3');
		return new Web3(
			new Web3.providers.HttpProvider(
				`https://speedy-nodes-nyc.moralis.io/${process.env.MORALISID}/polygon/${prefix}`
			)
		);
	}

	async getBlockNumber() {
		const web3 = await this.getMaticInfuraWeb3();
		return await web3.eth.getBlockNumber();
	}

	async getTotalSalesCount(): Promise <number>{
		const result = await (await this.getMarketplaceContract()).methods
			.salesCount()
			.call();
		return result;
	}

	async getSaleById(
		saleId: number,
		network: string = 'MATIC',
	): Promise<Sale> {
		const date = new Date();
		try {
			const contract = await this.getMarketplaceContract(network);
			const total = parseInt(
				await contract.methods.salesCount().call(),
				undefined
			);
			const sale = await contract.methods
				.sales(saleId)
				.call();
			sale.available = sale.finalPrice == 0 && ((date.getTime() / 1000) < parseInt(sale.endDate, undefined));
			return sale;
		} catch (error) {
			console.log(error);
		}		
	}

	toHumanValue(amount: string, decimals?: number): number {
    if (!decimals) {
      decimals = 18;
    }

    return parseFloat(
      this.toFixedNoRounding(
        3,
        math
          .chain(math.bignumber(amount))
          .divide(math.bignumber(10).pow(math.bignumber(decimals)))
          .done()
          .toFixed(4)
      )
    );
  }

	public toFixedNoRounding(n: any, d: any) {
    const reg = new RegExp(`^-?\\d+(?:\\.\\d{0,${n}})?`, 'g');
    const a = d.toString().match(reg)[0];
    const dot = a.indexOf('.');

    if (dot === -1) {
      return a + '.' + '0'.repeat(n);
    }

    const b = n - (a.length - dot) + 1;

    return b > 0 ? a + '0'.repeat(b) : a;
  }

	async getCurrentSalesOrAuctions(network: string,isAuction: boolean){
		let totalSales = await this.getTotalSalesCount();
	
		const cards:any = [];
		var count = 0;
		for (let i = 0; i < totalSales; i++){
			 let sale = await this.getSaleById(i)
			 if(sale.available && sale.isAuction == isAuction){
				cards.push({
					saleId: i, 
					auction: false,
					auctionOrSaleData: sale,
					forSale: true,
					price: this.toHumanValue(sale.fixedPrice.toString(), 18),
					nftAddress: sale.nftContractstring,
					network: network,
				});
				 count +=1
			}
		}
		
		return cards;
	}

	async getAllTokensByContractAddressAndNetwork(
		contractAddress: string,
		chain?: string
	) {
		const Moralis = require('moralis/node');
		await Moralis.start({
			serverUrl: process.env.SERVER_URL,
			appId: process.env.APP_ID,
			masterKey: process.env.MASTERKEY
		});
    try {
			let digiCards = [];
			const tokens = await Moralis.Web3API.token.getAllTokenIds({
				address: contractAddress,
				chain: "Matic"
			});

			tokens.result.forEach(async (element, index) => {
				if (element.token_uri.indexOf('https://api.digible.io') != -1) {
					return;
				}
				if (element.token_uri && element.token_uri.indexOf('ipfs://') != -1) {
					const rep = element.token_uri.replace(/^ipfs?:\/\//, '');
					element.token_uri = `https://digible.mypinata.cloud/ipfs/${rep}`;
				}
				if (element.token_uri) {
					await this.getTokenURIData(element.token_uri).then(
						(tokenData: any) => {
							if (typeof tokenData === 'object' && tokenData !== null) {
								let sameItem = digiCards.find(dc => dc.id === element.token_id);
								if (!sameItem) {
									digiCards.push({
										...element,
										id: element.token_id,
										network: 'MATIC',
										tokenData: tokenData,
									});
								}
							}
						}
					);
				}
			});
			return digiCards;
		} catch (e) {
		console.log(e);
		}
  }

  private getTokenURIData(urlValue): Promise<any> {
		let url = urlValue;
			if (!url || url.indexOf('http://') != -1) {
			return;
		}

    if (url && url.indexOf('ipfs://') != -1) {
			const rep = url.replace(/^ipfs?:\/\//, '');
			url = `https://digible.mypinata.cloud/ipfs/${rep}`;
		}

		// const link: any = this.sanitizer.bypassSecurityTrustResourceUrl(url);
		// url = link.changingThisBreaksApplicationSecurity;
		const parseJson = async (response) => {
		const text = await response.text();
			try {
				const json = JSON.parse(text);
				return json;
			} catch (err) {
					// throw new Error('Did not receive JSON, instead received: ' + text);
			}
    };
		// https://api.opensea.io/api/v2/metadata/matic/0x2953399124F0cBB46d2CbACD8A89cF0599974963/0xb3397a6feedff2b9fce9ca1086cb1bdd617c16bf0000000000000c0000002710
		let headers;
		if (url && url.indexOf('https://api.digible.io') != -1) {
			return;
		}
		if (url && url.indexOf('https://api.opensea.io') != -1) {
			headers = {
				headers: {
					'X-API-KEY': '7d2635eedf054d8eae7638cca334fb7e',
				},
			};
		}
    if (
			(url && url.indexOf('https://www.ferratipeace.club') != -1) ||
			url.indexOf('https://api2.mekafight.com') != -1 ||
			url.indexOf('https://api2.cryptopunksbunnies.com') != -1
		) {
			headers = {
				mode: 'no-cors',
			};
    }

		const digiData = fetch(url, headers)
		.then(parseJson)
		.then((result) => {
			if (result && result.statusCode === 404) return;
			if (!result) return;
			return result;
		});
		return digiData;
	}
}

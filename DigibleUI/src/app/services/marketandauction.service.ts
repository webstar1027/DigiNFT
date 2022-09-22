import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { MathService } from './math.service';
import { VerifiedWalletsService } from './verified-wallets.service';
import { WalletService } from './wallet.service';
import { NftService } from './nft.service';
import { address } from '@maticnetwork/maticjs/dist/ts/types/Common';

import { MoralisService } from './moralis.service';
import { OffchainService } from './offchain.service';
import { PendingDigiCard2 } from '../types/pending-digi-card2.types';
import { DigiCard2 } from '../types/digi-card2.types';
import { ERC20Currency } from '../types/ERC20currency.type';

@Injectable()
export class MarketplaceAndAuctionService {
	MAX_INT = BigInt(
		'0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
	);


	//##########################################################################
	// SMART CONTRACT NETWORK, CONNECTIVITY, SPEND APPROVALS CONFIGURATION
 	// USE THIS VAR TO CHECK IF THIS SERVICE SUPPORTS NETWORK IS CURRENTLY ON.
 	public suportedNetworks = ['MATIC', 'BSC'];

 	// IF ADDING NEW NETWORKS  SET ADDITIONAL CORRECT NETOWRK ENV VARS x2 IN getDigiTradeContract() below

	public getMyContractAddressByNetwork(network: string){
		if (network === 'MATIC') {
			return  environment.digiAuctionAndMarketPlaceMatic
		} else if (network === 'BSC') {
			return environment.digiAuctionAndMarketPlaceBSC
		}
	}

	private async getMarketplaceContract(
		readonly: boolean,
		network: string
	): Promise<any> {
		if(!network){
			network = this._network;
		 }
		const abi = require('../../assets/abis/digimarketandauction.json');
		
		
	    if (readonly) {
            
			return new (this.wallet.getWeb3ByNetwork(network).eth.Contract)(
			  abi,
			  this.getMyContractAddressByNetwork(network)
			);
		  
		}

	  // FOR SENDING TRANSACTIONS TO THE BLOCKCHAIN
	  else {
		
			  return new (this.wallet.getWeb3().eth.Contract)(
				  abi,
				  this.getMyContractAddressByNetwork(network)
			  );
		  

	  }
	}

	public async HowMuchAmIApprovedToSpendErc20(network: string, erc20address: string): Promise<number> {
		const approval = await this.wallet.checkApprovalToSpendErc20(
			this.getMyContractAddressByNetwork(network), network, erc20address);
		return approval;
	}

	public async approveMeToSpendErc20(network: string, erc20address: string): Promise<void> {
		return await this.wallet.approveSpendErc20(this.getMyContractAddressByNetwork(network), network, erc20address);
	}

	async amIApprovedAllERC721(
		nftAddress: string,
		owner: string,
		network: string
		): Promise<boolean> {
		const abi = require('../../assets/abis/erc721.json');
		const nft = new (this.wallet.getWeb3().eth.Contract)(abi, nftAddress);
		return await nft.methods.isApprovedForAll(owner,  this.getMyContractAddressByNetwork(network)).call();
	}
		

	public async approveMeAllERC721(network: string, erc721address: string): Promise<void> {
		return await this.wallet.approveAllErc721(erc721address, this.getMyContractAddressByNetwork(network));
	}

	private marketplaceAddressMatic = environment.digiAuctionAndMarketPlaceMatic;
	private marketplaceAddressEth = environment.digiAuctionAndMarketPlaceEth;
	private marketplaceAddressBSC = environment.digiAuctionAndMarketPlaceBSC;
	private _network = environment.defaultNetwork;
	currentSalesCount = 0;
	marketplaceContract;
	lastProcessedSaleIndex = -1;
	

	currentAccount: string;

	constructor(
		private readonly wallet: WalletService,
		private readonly nft: NftService,
		private readonly math: MathService,
		private readonly verifiedProfiles: VerifiedWalletsService,
		private readonly moralis: MoralisService,
		private readonly offchain: OffchainService
	) { this.setMarketPlaceContract('MATIC');}

	async buy(saleId: number, network: string): Promise<void> {
		if(!network){
		 network = this._network;
		}

		const from = await this.getAccount();
		await (await this.getMarketplaceContract(false, network)).methods
			.directBuy(saleId)
			.send({ from })
			.once("receipt", async (receipt) => {
				console.log(receipt, 'direct buy once');
				const e = receipt.events?.DirectBought?.returnValues;
				this.offchain.updateSaleData(e?.saleId, network, {
					finalPrice: e?.amount,
					available: false 
				});
			});
	}

	async cancelSale(saleId: number, network: string): Promise<void> {
		if(!network){
			network = this._network;
		 }
		const from = await this.getAccount();
		await (await this.getMarketplaceContract(false, network)).methods
			.cancelSale(saleId)
			.send({ from })
			.once("receipt", async (receipt) => {
				console.log(receipt, 'removeSale');
				this.offchain.removeSaleData(receipt.events?.SaleCXL?.returnValues?.saleId, network);
			});
	}

	async createSaleFromHumanPrice(tokenId: number,
		tokenAddress: string,
		price: string,
		duration: number,
		erc20: ERC20Currency ) : Promise<number> {

		var newSaleId = await this.createSale(
			tokenId,
			tokenAddress,
			this.math.toBlockchainValue(price, erc20.decimalPlaces),
			duration,
			erc20.network,
			erc20.contractAddress
		)

		console.log("New Sale ID", newSaleId, "listed for ", this.math.toBlockchainValue(price, erc20.decimalPlaces));
	
			return newSaleId;
		}

	async createSale(
		tokenId: number,
		tokenAddress: string,
		price: string,
		duration: number,
		network: string,
		currencyAddress: string
	): Promise<number> {
		if(!network){
			network = this._network;
		 }
		const from = await this.getAccount();
		return await (await this.getMarketplaceContract(false, network)).methods
			.createSaleAnyCurrency(
				tokenId,
				tokenAddress,
				price,
				duration,
				currencyAddress
			)
			.send({ from })
			.once("receipt", async (receipt) => {
				console.log("createSale", receipt);
				this.offchain.createSaleData(receipt.events?.NewSaleIdCreated?.returnValues?.saleId, network);
			});
	}

	async createAuctionHumanPrice(
		tokenAddress: string,
		tokenId: number,
		minPrice: string,
		fixedPrice: string,
		duration: number,	
		erc20: ERC20Currency
	): Promise<number> {

		return await this.createAuction(
			tokenId,
			this.math.toBlockchainValue(minPrice, erc20.decimalPlaces),
			this.math.toBlockchainValue(fixedPrice, erc20.decimalPlaces),			
			duration,
			erc20.network,
			erc20.contractAddress,
			tokenAddress
		)
	}

	async createAuctionFromHumanPrice(
		tokenId: number,
		tokenAddress: string,
		minPrice: string,
		fixedPrice: string,
		duration: number,
		erc20: ERC20Currency
		
	): Promise<number> {
		return await this.createAuction(
			tokenId,
			this.math.toBlockchainValue(minPrice, erc20.decimalPlaces),
			this.math.toBlockchainValue(fixedPrice, erc20.decimalPlaces),
			duration,
			erc20.network,
			erc20.contractAddress,
			tokenAddress,
		)
	}

	async checkAllowedForSale(
		
		contractAddress: string,
		network: string,
		currency?: string
	): Promise<number> {
		if(!network){
			network = this._network;
		 }
		const account = await this.getAccount();
		const contract = await this.nft.getCurrencyContract(
			currency,
			network,
			true
		);
		return await contract.methods.allowance(account, contractAddress).call();
	}

	async getFee(network: string): Promise<number> {
		if(!network){
			network = this._network;
		 }
		return parseInt(
			await (await this.getMarketplaceContract(true, network)).methods
				.purchaseFee()
				.call(),
			undefined
		);
	}

	async getRoyaltyFee(
		tokenId: number,
		network: string,
		tokenAddress: string
	): Promise<number> {
		if(!network){
			network = this._network;
		 }
		return parseInt(
			(
				await (await this.getMarketplaceContract(true, network)).methods
					.royaltiesByTokenByContract(tokenAddress, tokenId)
					.call()
			).fee,
			undefined
		);
	}

	async applyRoyalty(
		tokenId: number,
		beneficiary: string,
		fee: number,
		network: string,
		tokenAddress: string
	): Promise<number> {
		if(!network){
			network = this._network;
		 }
		const from = await this.getAccount();
		return await (await this.getMarketplaceContract(false, network)).methods
			.setRoyaltyForToken(tokenAddress, tokenId, beneficiary, fee)
			.send({ from });
	}

	async hasRoyalty(
		tokenAddress: string,
		tokenId: number,
		network: string,
		owner?: string
	): Promise<boolean> {
		if(!network){
			network = this._network;
		 }
		if (owner) {
			const wallet = (
				await (await this.getMarketplaceContract(true, network)).methods
					.royaltiesByTokenByContract(tokenAddress, tokenId)
					.call()
			).wallet;
			return (
				wallet !== '0x0000000000000000000000000000000000000000' &&
				wallet !== owner
			);
		}
		return (
			(
				await (await this.getMarketplaceContract(true, network)).methods
					.royaltiesByTokenByContract(tokenAddress, tokenId)
					.call()
			).wallet !== '0x0000000000000000000000000000000000000000'
		);
	}

	async getSaleForToken(
		address: string,
		tokenId: number,
		network: string
	): Promise<null | {
		tokenId: string;
		tokenAddress: string;
		owner: string;
		fixedPrice: string;
		finalPrice: number;
		endDate: string;
		available: boolean;
		saleId: number;
	}> {
		let saleId;
		if(!network){
			network = this._network;
		 }
		try {
			saleId = parseInt(
				await (await this.getMarketplaceContract(true, network)).methods
					.lastSaleByToken(address, tokenId)
					.call(),
				undefined
			);
		} catch (error) {
			console.error('ERROR:', error);
		}
		if (
			saleId === 0 &&
			localStorage.getItem('sale0') &&
			tokenId !== parseInt(localStorage.getItem('sale0'), undefined)
		) {
			return null;
		}
		let sale;
		try {
			sale = await this.getSaleById(saleId, network);
		} catch (e) {
			console.log(e);
		}
		if (parseInt(sale.tokenId, undefined) !== tokenId) {
			return null;
		}
		if (saleId === 0) {
			localStorage.setItem('sale0', tokenId + '');
		}
		return { saleId, ...sale };
	}

 

	async lastSells(
		tokenId: string,
		nftContractAddress: string,
		network: string
	): Promise<
		{ amount: string; created: number; wallet: string; username: string }[]
	> {
		if(!network){
			network = this._network;
		 }
		const market = await await this.getMarketplaceContract(true, network);

		return new Promise(async (resolve, reject) => {
			await market.getPastEvents(
				'DirectBought',
				{
					filter: { tokenId, nftContractAddress },
					fromBlock: 0,
					toBlock: 'latest',
				},
				(error, events) => {
					if (error) {
						reject(error);
					} else {
						resolve(
							events.map((eventFiltered) => {
								eventFiltered.returnValues.humanAmount = this.math.toHumanValue(
									eventFiltered.returnValues.amount
								);
								eventFiltered.returnValues.username =
									this.verifiedProfiles.getVerifiedName(
										eventFiltered.returnValues.wallet
									);
								eventFiltered.returnValues.created =
									eventFiltered.returnValues.created;
								return eventFiltered.returnValues;
							})
						);
					}
				}
			);
		});
	}

	async lastBuys(
		wallet: string,
		limit: number,
		network: string
	): Promise<
		{ amount: string; created: number; wallet: string; username: string }[]
	> {
		if(!network){
			network = this._network;
		 }
		const market = await this.getMarketplaceContract(true, network);
		return new Promise(async (resolve, reject) => {
			await market.getPastEvents(
				'DirectBought',
				{
					filter: { wallet },
					fromBlock: 0,
					toBlock: 'latest',
				},
				(error, events) => {
					if (error) {
						reject(error);
					} else {
						resolve(
							events
								.map((eventFiltered) => {
									eventFiltered.returnValues.humanAmount =
										this.math.toHumanValue(eventFiltered.returnValues.amount);
									eventFiltered.returnValues.username =
										this.verifiedProfiles.getVerifiedName(
											eventFiltered.returnValues.wallet
										);
									eventFiltered.returnValues.created =
										eventFiltered.returnValues.created * 1000;
									return eventFiltered.returnValues;
								})
								.slice(0, limit)
						);
					}
				}
			);
		});
	}

	async getLastSales(limit: number, offset?: number) {
		return [
			...(await this.getLastMaticSales(limit, offset)),
			/* ...(await this.getLastEthAuctions(limit, offset)) */
		].sort(() => Math.random() - 0.5);
	}
	// NEEDS ATTENTION
	async getLastMaticSales(limit: number, offset?: number): Promise<DigiCard2[]> {
		if (!offset) {
			offset = 0;
		}
		limit = limit + offset;
		const market = await this.getMarketplaceContract(true, 'MATIC');
		const total = parseInt(await market.methods.salesCount().call(), undefined);
		if (total === 0) {
			return [];
		}
		const cards: DigiCard2[] = [];

		for (let saleId = total - offset; saleId > total - limit; saleId--) {
			if (saleId < 0) {
				break;
			}

			let sale;
			try {
				sale = await this.getSaleById(saleId, 'MATIC');
			} catch (e) {
				console.log(e);
			}
			if (!sale.available || sale.isAuction) {
				continue;
			}
			let found = false;
			for (const card of cards) {
				if (sale.tokenId === card.token_id) {
					found = true;
					continue;
				}
			}
			if (found) {
				continue;
			}

			if (
				sale.tokenAddress === environment.nftAddress &&
				environment.deletedNfts.indexOf(parseInt(sale.tokenId, undefined)) !==
				-1
			) {
				continue;
			}
			cards.push({
				token_id: sale.tokenId,
				auction: false,
				auctionOrSaleData: sale,
				forSale: true,
				price: this.math.toHumanValue(sale.price, 18),
				nftAddress: sale.tokenAddress,
				network: 'MATIC',
				saleId: saleId
			});
		}
		return cards;
	}

	getMarketplaceAddress(network: string): string {
		if(!network){
			network = this._network;
		 }
		if (network === 'ETH') {
			return this.marketplaceAddressEth;
		} else if (network === 'MATIC') {
			return this.marketplaceAddressMatic;
		} else if (network === 'BSC') {
			return this.marketplaceAddressBSC;
		}
	}

	// DEPRECATED
	getAuctionAddress(network: string): string {
		if(!network){
			network = this._network;
		 }
		return (this.getMarketplaceAddress(network));
	}




	private async getAccount(): Promise<string | null> {
		if (!this.currentAccount) {
			this.currentAccount = await this.wallet.getAccount();
		}
		return this.currentAccount;
	}

	// AUCTION FUNCTIONS:

	async getAuctionIdByToken(
		tokenId: number,
		network: string,
		tokenAddress: string
	): Promise<number | null> {
		let auction;
		if(!network){
			network = this._network;
		 }
		try {
			auction = parseInt(
				await (await this.getMarketplaceContract(true, network)).methods
					.lastAuctionByTokenByContract(tokenAddress, tokenId)
					.call(),
				undefined
			);
		} catch (e) {
			console.log('getAuctionIdByToken ERROR ::', e);
		}
		if (auction === 0 && tokenId !== environment.tokenIdForAuction0) {
			return null;
		}
		return auction;
	}

	async directBuy(auctionId: number, network: string): Promise<void> {
		if(!network){
			network = this._network;
		 }
		this.buy(auctionId, network);
	}

	async cancel(auctionId: number, network: string): Promise<void> {
		if(!network){
			network = this._network;
		 }
		const from = await this.getAccount();
		await (await this.getMarketplaceContract(false, network)).methods
			.cancelAuction(auctionId)
			.send({ from })
			.once("receipt", async (receipt) => {
				console.log(receipt, 'cancel auction once');
				this.offchain.removeSaleData(receipt.events?.CanceledAuction?.returnValues?.saleId, network);
			});
	}

	async createAuction(
		tokenId: number,
		minPrice: string,
		fixedPrice: string,
		duration: number,
		network: string,
		paymentCurrency: string,
		tokenAddress?: string
	): Promise<number> {
		if(!network){
			network = this._network;
		}
		const from = await this.getAccount();
		let nftContractAddress;

		if (network === 'ETH') nftContractAddress = environment.nftAddress;
		else if (network === 'MATIC')	nftContractAddress = environment.nftAddressMatic;
		else if (network === 'BSC') nftContractAddress = environment.nftAddressBSC;

		if (tokenAddress) {
			nftContractAddress = tokenAddress;
		}
		console.log(nftContractAddress, paymentCurrency);

		try {
			const contract = await this.getMarketplaceContract(false, network);
			const response = await contract.methods
				.createAuction(
					nftContractAddress,
					tokenId,
					minPrice,
					fixedPrice,
					paymentCurrency,
					duration
				)
				.send({ from: from })
				.once("receipt", async (receipt) => {
					console.log("create auction", receipt);
					this.offchain.createSaleData(receipt.events?.CreatedAuction?.returnValues?.saleId, network);
				});
			return response;
		} catch (e) {
			console.log('createAuction ERROR ::', e);
			return e;
		}
	}

	async claim(auctionId: number, network: string): Promise<void> {
		if(!network){
			network = this._network;
		 }
		const from = await this.getAccount();
		await (await this.getMarketplaceContract(false, network)).methods
			.claim(auctionId)
			.send({ from });
	}

	async bid(auctionId: number, amount: string, network: string): Promise<void> {
		if(!network){
			network = this._network;
		 }
		const from = await this.getAccount();
		// amount = String(Number(amount));
		const contract = await this.getMarketplaceContract(false, network);minPrice: 
		await contract.methods
			.participateAuction(auctionId, amount)
			.send({ from: from })
			.once("receipt", async (receipt) => {
				console.log(receipt, 'new highest offer once');
				const e = receipt.events?.NewHighestOffer?.returnValues;
				this.offchain.updateSaleData(e?.saleId, network, {
					minPrice: e?.amount
				});
			});
	}

	async getAuctionById(
		auctionId: number,
		network: string
	): Promise<{

		nftContractstring: string;
		tokenId: number;
		owner: address;
		isAuction: boolean;
		minPrice: number;
		fixedPrice: number;
		paymentCurrency: address;
		royalty: boolean;
		endDate: string;
		paymentClaimed: boolean;
		royaltyClaimed: boolean;
		finalPrice: number;
		refunded: boolean;
		available: boolean;

	}> {
		if(!network){
			network = this._network;
		 }
		const date = new Date();
		let auction;
		try {
			auction = await (await this.getMarketplaceContract(true, network)).methods
				.sales(auctionId)
				.call();
			auction.available =
				auction.finalPrice == 0 &&
				date.getTime() / 1000 < parseInt(auction.endDate, undefined);
		} catch (e) {
			console.log('getAuctionById ERROR ::', e);
		}
		return auction;
	}

	async isClaimed(auctionId: number, network: string): Promise<boolean> {
		return await (await this.getMarketplaceContract(true, network)).methods
			.claimedAuctions(auctionId)
			.call();
	}

	// NEEDS ATTENTION
	async getLastAuctionPrices(

		tokenId: number,
		limit: number,
		network: string
	): Promise<
		{ amount: string; wallet: string; created: number; username: string }[]
	> {
		if(!network){
			network = this._network;
		 }
		// network = 'MATIC';
		let fromBlock;
		if (network === 'MATIC') {
			fromBlock =
				(await this.wallet.getMaticInfuraWeb3().eth.getBlockNumber()) -
				environment.blocksInEvents;
		} else if (network === 'ETH') {
			fromBlock =
				(await this.wallet.getInfuraWeb3().eth.getBlockNumber()) -
				environment.blocksInEvents;
		} else if (network === 'BSC') {
			fromBlock =
				(await this.wallet.getBSCWeb3().eth.getBlockNumber()) -
				environment.blocksInEvents;
		}
		return new Promise(async (resolve, reject) => {
			await (
				await this.getMarketplaceContract(true, network)
			).getPastEvents(
				'Claimed',
				{
					filter: {
						tokenId,

					},
					fromBlock,
					toBlock: 'latest',
				},
				(error, events) => {
					if (error) {
						resolve(error);
					} else {
						resolve(
							events
								.map((event) => {
									event.returnValues.humanAmount = this.math.toHumanValue(
										event.returnValues.amount
									);
									event.returnValues.username =
										this.verifiedProfiles.getVerifiedName(
											event.returnValues.wallet
										);
									return event.returnValues;
								})
								.slice(0, limit)
						);
					}
				}
			);
		});
	}

	// Deprecated use lastSells  
	async getLastAuctionBuyNows(
		tokenId: string,
		nftContractAddress: string,
		network: string

	): Promise<
		{ amount: string; wallet: string; created: number; username: string }[]
	> {
		if(!network){
			network = this._network;
		 }
		return this.lastSells(tokenId, nftContractAddress, network);
	}

	// Deprecated use lastBuys
	async getLastAuctionBuyNowsByAddress(
		wallet: string,
		limit: number,
		network: string
	): Promise<
		{ amount: string; wallet: string; created: number; username: string }[]
	> {
		if(!network){
			network = this._network;
		 }
		return this.lastBuys(wallet, limit, network);
	}

	async getHighestOffer(auctionId: number, network: string) {
		if(!network){
			network = this._network;
		 }
		const contract = await this.getMarketplaceContract(true, network);
		const array = [];
		array.push(await contract.methods.highestOffers(auctionId).call());
		return array;
	}

	async getLastBids(
		auctionId: number,
		limit: number,
		network: string
	): Promise<{ amount: string; wallet: string; created: number }[]> {
		if(!network){
			network = this._network;
		 }

		return new Promise(async (resolve, reject) => {
			let logs, chunks;
			chunks = 10000; // Even 10,000 chunks have a few segments that error out
			logs = [];
			for (let i = 0; i < 10000000; i += chunks) {
				await (
					await this.getMarketplaceContract(true, network)
				).getPastEvents(
					'NewHighestOffer',
					{
						filter: {
							auctionId,
						},
						fromBlock: 0,
						toBlock: i + chunks - 1,
					},
					(error, events) => {
						if (error) {
							reject(error);
						} else {
							resolve(
								events
									.map((event) => {
										event.returnValues.amount = this.math.toHumanValue(
											event.returnValues.amount
										);
										event.returnValues.created =
											event.returnValues.created * 1000;
										return event.returnValues;
									})
									.slice(0, limit)
							);
						}
					}
				);
			}
		});
	}

	async getLastBidsByUser(
		wallet: string,
		limit: number,
		network: string
	): Promise<{ amount: string; wallet: string; created: number }[]> {
		if(!network){
			network = this._network;
		 }
		// network = 'MATIC';
		let fromBlock;
		if (network === 'MATIC') {
			fromBlock =
				(await this.wallet.getMaticInfuraWeb3().eth.getBlockNumber()) -
				environment.blocksInEvents;
		} else if (network === 'ETH') {
			fromBlock =
				(await this.wallet.getInfuraWeb3().eth.getBlockNumber()) -
				environment.blocksInEvents;
		} else if (network === 'BSC') {
			fromBlock =
				(await this.wallet.getBSCWeb3().eth.getBlockNumber()) -
				environment.blocksInEvents;
		}
		return new Promise(async (resolve, reject) => {
			let logs, chunks;
			chunks = 3500; // Even 10,000 chunks have a few segments that error out
			logs = [];
			for (let i = 0; i < 10000000; i += chunks) {
				await (
					await this.getMarketplaceContract(true, network)
				).getPastEvents(
					'NewHighestOffer',
					{
						filter: {
							wallet,
						},
						fromBlock: i,
						toBlock: i + chunks - 1,
					},
					(error, events) => {
						if (error) {
							console.log('ERROR', error);
							/*  console.error(error);
						resolve([]); */
						} else {
							resolve(
								events
									.map((event) => {
										event.returnValues.amount = this.math.toHumanValue(
											event.returnValues.amount
										);
										event.returnValues.humanAmount = event.returnValues.amount;
										event.returnValues.created =
											event.returnValues.created * 1000;
										return event.returnValues;
									})
									.slice(0, limit)
							);
						}
					}
				);
			}
		});
	}

	async getAuctionPrice(
		auctionId: number,
		auction: any,
		network: string
	): Promise<{
		price: string;
		winner: string;
	}> {
		if(!network){
			network = this._network;
		 }
		const auctions = await this.getMarketplaceContract(true, network);
		const offer = await auctions.methods.highestOffers(auctionId).call();
		let price = offer.offer;
		const winner = offer.buyer;
		if (price === '0') {
			price = auction.minPrice;
		}
		return { price, winner };
	}

	async getLastEthAuctions(
		limit: number,
		offset?: number
	): Promise<DigiCard2[]> {
		if (!offset) {
			offset = 0;
		}

		limit = limit + offset;
		const contract = await this.getMarketplaceContract(true, 'ETH');
		const total = parseInt(
			await contract.methods.salesCount().call(),
			undefined
		);
		if (total === 0) {
			return [];
		}

		const digiCards: DigiCard2[] = [];
		for (
			let auctionId = total - offset;
			auctionId > total - limit;
			auctionId--
		) {
			if (auctionId < 0) {
				break;
			}
			const auction = await this.getAuctionById(auctionId, 'ETH');
			if (!auction.available || !auction.isAuction) {
				continue;
			}
			if (
				environment.deletedNfts.indexOf(
					auction.tokenId
				) !== -1
			) {
				continue;
			}
			const price = (await this.getAuctionPrice(auctionId, auction, 'ETH'))
				.price;
			digiCards.push({
				saleId: auctionId,
				auction: true,
				price: this.math.toHumanValue(price),
				network: 'ETH',
				token_id: auction.tokenId.toString()
			});
		}
		return digiCards;
	}

	async getLastMaticAuctions(
		limit: number,
		offset?: number
	): Promise<DigiCard2[]> {
		if (!offset) {
			offset = 0;
		}
		limit = limit + offset;
		const contract = await this.getMarketplaceContract(true, 'MATIC');
		const total = parseInt(
			await contract.methods.auctionCount().call(),
			undefined
		);
		if (total === 0) {
			return [];
		}

		const digiCards: DigiCard2[] = [];
		for (
			let auctionId = total - offset;
			auctionId > total - limit;
			auctionId--
		) {
			if (auctionId < 0) {
				break;
			}
			const auction = await this.getAuctionById(auctionId, 'MATIC');
			if (!auction.available) {
				continue;
			}
			if (
				environment.deletedNfts.indexOf(
					auction.tokenId
				) !== -1
			) {
				continue;
			}
			const price = (await this.getAuctionPrice(auctionId, auction, 'MATIC'))
				.price;
			digiCards.push({
				saleId: auctionId, 
				auction: true,
				forSale: false,
				auctionOrSaleData: auction,
				price: this.math.toHumanValue(price),
				network: 'MATIC',
				nftAddress: auction.nftContractstring,
				token_id: auction.tokenId.toString()
			});
		}
		return digiCards;
	}

	async getLastAuctions(limit: number, offset?: number) {
		return [
			...(await this.getLastMaticAuctions(limit, offset)),
			/* ...(await this.getLastEthAuctions(limit, offset)) */
		].sort(() => Math.random() - 0.5);
	}

	async pendingAuctions(
		limit: number,
		network: string
	): Promise<PendingDigiCard2[]> {
		if(!network){
			network = this._network;
		 }
		const auctions = await this.getMarketplaceContract(true, network);
		const account = await this.getAccount();
		const total = parseInt(
			await auctions.methods.auctionCount().call(),
			undefined
		);
		if (total === 0) {
			return [];
		}

		const digiCards: PendingDigiCard2[] = [];

		for (let auctionId = total - 1; auctionId > total - limit; auctionId--) {
			if (auctionId < 0) {
				break;
			}
			const auction = await this.getAuctionById(auctionId, network);
			const offer = await this.getAuctionPrice(auctionId, auction, network);
			if (
				(auction.owner === account || offer.winner === account) &&
				!auction.available
			) {
				if (await this.isClaimed(auctionId, network)) {
					continue;
				}
				const sold =
					!auction.available &&
					(offer.winner !== '0x0000000000000000000000000000000000000000');
				if (!sold) {
					const nftData: any = await this.moralis.getNftDataFromMoralis(
						auction.nftContractstring,
						auction.tokenId.toString(),
						network
					);
					const currentOwner = nftData.owner_of;
					if (
						currentOwner.toLowerCase() !==
						environment.digiAuctionAndMarketPlaceMatic.toLowerCase()
					) {
						continue;
					}
				}
				let card = {
					tokenId: auction.tokenId,
					saleId: auctionId,
					seller: auction.owner === account,
					sold,
					network: network,
					nftAddress: auction.nftContractstring,
					pendingAuction: true,
				};

				digiCards.push(card);
			}
		}
		return digiCards;
	}
	async getSaleById(
		saleId: number,
		network: string
	): Promise<{
		nftContractstring: address;
		tokenId: number;
		owner: address;
		isAuction: boolean;
		minPrice: number;
		fixedPrice: number;
		paymentCurrency: address;
		royalty: boolean;
		endDate: string;
		paymentClaimed: boolean;
		royaltyClaimed: boolean;
		finalPrice: number;
		refunded: boolean;
		available: boolean;
	}> {
		if(!network){
			network = this._network;
		 }
		const date = new Date();
		const sale = await (
			await this.getMarketplaceContract(false, network)
		).methods
			.sales(saleId)
			.call();
		sale.available =
			sale.finalPrice == 0 && date.getTime() / 1000 < parseInt(sale.endDate, undefined);
		return sale;
	}

async getTotalSalesCount(network: string): Promise <number>{
	if(!network){
		network = environment.defaultNetwork;
	}
	const result = await (await this.getMarketplaceContract(true, network)).methods
		.salesCount()
		.call();
		this.currentSalesCount = result;
		return this.currentSalesCount;
}


async getCurrentSalesOrAuctions(network: string, startIndex: number, maxResults: number, isAuction: boolean){
	if(!network){
		network = this._network;
	 }

	var totalSales = await this.getTotalSalesCount(network);
	if(startIndex > totalSales-1) {
		return [];
	}

	const cards: DigiCard2[] = [];
	var count = 0;
	let owner = '';
	for (let i = startIndex; i < totalSales; i++){
	 	let sale = await this.getSaleById(i, network)
	 	if(sale.available && sale.isAuction == isAuction){
			if (owner === '') {
				owner = sale.owner;
			} else {
				if (owner !== sale.owner && cards.length > 0) {
					this.lastProcessedSaleIndex = i;
					break;
				}
			}
			cards.push({
				saleId: i, 
				auction: false,
				auctionOrSaleData: sale,
				forSale: true,
				price: this.math.toHumanValue(sale.fixedPrice.toString(), 18),
				nftAddress: sale.nftContractstring,
				network: network,
			});
			count +=1;
		}
	}
	
	return cards;
}


async getLastSaleIdByToken(network: string, nftContractAddress: string, tokenId: number) : Promise <number>{
	if (!network){
		network = this._network;
	}

	var saleId = await (await this.getMarketplaceContract(true, network)).methods
		.lastSaleByToken(nftContractAddress, tokenId)
		.call();
	return saleId;
}

async canOwnerSetRoyalty(network: string, nftContractAddress: string, tokenId: number){
	if(!network){
		network = this._network;
	 }

	 var saleId = await (await this.getMarketplaceContract(true, network)).methods
	 .lastSaleByToken(nftContractAddress, tokenId)
	 .call();

	if(saleId > 0) {return false };

	var auct = await (await this.getMarketplaceContract(true, network)).methods
		.lastAuctionByTokenByContract(nftContractAddress, tokenId)
		.call();
	if(auct > 0) {return false};
	return true;
}

	async getCurrentSales(network: string, startIndex: number, maxResults: number){
		if (!network){
			network = this._network;
		}
	 	return await this.getCurrentSalesOrAuctions(network, startIndex, maxResults, false)
	}

	async getCurrentAuctions(network: string, startIndex: number, maxResults: number){
		if (!network){
			network = this._network;
		}
		return await this.getCurrentSalesOrAuctions(network, startIndex, maxResults, true)
	}

	async approveCurrency(
		addressMarketContractToApprove: string,
		network: string,
		currency: string
	): Promise<void> {
		if(!network){
			network = this._network;
		 }
		const account = await this.getAccount();
		await (await this.nft.getCurrencyContract(currency, network, false)).methods
			.approve(addressMarketContractToApprove, this.MAX_INT)
			.send({ from: account });
	}

	async setMarketPlaceContract(network: string) {
		if(!network){
			network = this._network;
		 }
		this.marketplaceContract = await this.getMarketplaceContract(
			true,
			network
		);
	}

	async getAllSalesData(
		network: string
	): Promise<any> {
		if(!network){
			network = this._network;
		 }
		const date = new Date();
		let auctions = [];
		try {
			const contract = await this.getMarketplaceContract(true, network);
			const total = parseInt(
				await contract.methods.salesCount().call(),
				undefined
			);
			console.log(total, 'total sales number');
			for (let index = 0; index < total; index++) {
				const auction = await contract.methods
					.sales(index)
					.call();
				auction.available =
					auction.finalPrice == 0 &&
					date.getTime() / 1000 < parseInt(auction.endDate, undefined);
				auction.saleId = index;
				auctions.push(auction);
			}
			console.log(auctions);
			
		} catch (e) {
			console.log('getAuctionById ERROR ::', e);
		}
		return auctions;
	}
}
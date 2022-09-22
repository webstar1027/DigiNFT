import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnInit,
	ViewChild,
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { TokensService } from 'src/app/services/tokens.service';
import { WalletService } from 'src/app/services/wallet.service';
import { VerifiedWalletsService } from 'src/app/services/verified-wallets.service';
import { DigiCard } from 'src/app/types/digi-card.types';
import { Profile } from 'src/app/types/profile.type';
import { environment } from 'src/environments/environment';
import { MathService } from '../../services/math.service';
import { NftService } from '../../services/nft.service';
import { MoralisService } from '../../services/moralis.service';
import { MarketplaceAndAuctionService } from 'src/app/services/marketandauction.service';
import { Network } from '../../types/network.enum';
import { PendingDigiCard } from '../../types/pending-digi-card.types';
import { OffchainService } from 'src/app/services/offchain.service';
import { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { DigiTrackService } from 'src/app/services/digitrack.service';
import { Moralis } from 'moralis';


@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',  
	styleUrls: ['./profile.component.scss'],
	animations: [
		trigger('fade', [
			transition('void => active', [
				style({ opacity: 0 }),
				animate(10000, style({ opacity: 1 })),
			]),
		]),
	],
})
export class ProfileComponent implements OnInit {
	@ViewChild('addTokenModal') addTokenModal: ElementRef;
	imageUrlPreviewIcon;
	imageUrlPreviewHero;
	picturefileBase64String;
	herofileBase64String;
	pictureName;
	heroPictureName;
	address;
	displayAddress;
	profile: Profile;
	myCards = [];
	myCardsFiltered = [];
	otherNfts: DigiCard[];
	pendingAuctions: PendingDigiCard[];
	pendingTransfersFromMatic = [];
	network;
	stableSymbol = environment.stableCoinSymbol;
	digiBalance = '...';
	stableBalance = '...';
	isYourProfile = false;
	loading = true;
	activityHistory = null;
	loadFiles = [];
	tokenName;
	inputAddress;
	verifiedAddress;
	maticNfts = [];
	ethNFTs = [];
	nftArray = [];
	ipfs = [];
	heroPicture;
	picture;
	isDigisafe;
	myCode = "";

	typeFilter = 'ALL';
	filterBy = [
		{ name: 'All', id: 'ALL' },		
		{ name: 'Physically Backed', id: 'PHYSICAL' },
		{ name: 'MATIC Network', id: 'MATIC' },
		{ name: 'BSC', id: 'BSC' },
		// { name: 'Digi Cubes', id: 'DIGICUBE' },
		// { name: 'Digi Keys', id: 'DIGIKEYS' },
		// { name: 'POKEMON PHYGITALS', id: 'POKEMON' },
		// { name: 'STAR WARS PHYGITALS', id: 'STAR WARS' },

	
		{ name: 'Digital Only', id: 'DIGITAL' },
		/* { name: 'Recently Added', id: 'RECENT' },
		{ name: 'Date Created', id: 'DATE CERATED' },
		{ name: 'Alphabetical', id: 'ALPHABETICAL' }, */
	];
  showZoomImage: boolean = false;
  imageObject: Array<object> = [];

	constructor(
		private readonly route: ActivatedRoute,
		private readonly walletService: WalletService,
		private readonly nft: NftService,
		private readonly math: MathService,
		private readonly cdr: ChangeDetectorRef,
		private readonly tokens: TokensService,
		private readonly verifiedWallets: VerifiedWalletsService,
		private readonly router: Router,
		private readonly marketplace: MarketplaceService,
		private readonly offchain: OffchainService,
		private readonly moralis: MoralisService,
		private readonly digitrack: DigiTrackService,
		private readonly market: MarketplaceAndAuctionService
	) {}

	ngOnInit(): void {
		this.route.params.subscribe(async (queryParams) => {
			this.verifiedAddress = await this.verifiedWallets.getVerifiedAddress(
				queryParams.address
			);
			if (this.verifiedAddress) {
				this.address = queryParams.address;
				this.displayAddress = this.truncate(queryParams.address, 15, '...');
			} else {
				if (
					!this.walletService.getWeb3().utils.isAddress(queryParams.address)
				) {
					this.router.navigate(['/auctions']);
					return;
				}
				this.address = queryParams.address;
				this.displayAddress = this.truncate(queryParams.address, 15, '...');
			}
			this.loadData();
		});
	}

	async dropped(files: NgxFileDropEntry[], imageType: string): Promise<void> {
		if (files.length === 0) {
			return;
		}

		if (imageType === 'hero_picture') {
			const droppedFile = files[0];
			if (
	      droppedFile &&
	      droppedFile.fileEntry.isFile &&
	      this.isFileAllowed(droppedFile.fileEntry.name)
	    ) {
				const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
				fileEntry.file(async (file: any) => {
					const toBase64 = (someFile) =>
						new Promise((resolve, reject) => {
							const reader = new FileReader();
							reader.readAsDataURL(someFile);
							reader.onerror = (error) => reject(error);
							reader.onload = () => {
								this.imageUrlPreviewHero = reader.result;
								resolve(reader.result);
							};
						});
					const baseString: any = await toBase64(file);
					this.herofileBase64String = baseString;
					this.heroPictureName = fileEntry.name;
				});
			}
		}
		if (imageType === 'picture') {
			this.picture = files[0];
			const droppedFile = files[0];
			if (
	      droppedFile &&
	      droppedFile.fileEntry.isFile &&
	      this.isFileAllowed(droppedFile.fileEntry.name)
	    ) {
				const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
				fileEntry.file(async (file: any) => {
					const toBase64 = (someFile) =>
						new Promise((resolve, reject) => {
							const reader = new FileReader();
							reader.readAsDataURL(someFile);
							reader.onerror = (error) => reject(error);
							reader.onload = () => {
								this.imageUrlPreviewIcon = reader.result;
								resolve(reader.result);
							};
						});
					const baseString: any = await toBase64(file);
					this.picturefileBase64String = baseString;
					this.pictureName = fileEntry.name;
				});
			}
		}
	}

	isFileAllowed(fileName: string) {
    let isFileAllowed = false;
    const allowedFiles = ['.png', '.jpg', '.jpeg', '.gif', '.jpeg', '.mp4'];
    const regex = /(?:\.([^.]+))?$/;
    const extension = regex.exec(fileName);
    if (undefined !== extension && null !== extension) {
      for (const ext of allowedFiles) {
        if (ext === extension[0]) {
          isFileAllowed = true;
        }
      }
    }
    return isFileAllowed;
  }

	async updateProfile(): Promise<void> {
		try {
			let imageFile;
      let image = this.herofileBase64String
      let imageName = this.heroPictureName;
     	
     	if (!!this.heroPictureName && !!this.herofileBase64String) {
     		imageFile = new Moralis.File(imageName, {base64: image});
		    await imageFile.saveIPFS({useMasterKey:true});
		    this.heroPicture = imageFile.ipfs();
     	}
      
      image = this.picturefileBase64String;
      imageName = this.pictureName;
     	
     	if (!!this.pictureName && !!this.picturefileBase64String) {
     		imageFile = new Moralis.File(imageName, {base64: image});
		    await imageFile.saveIPFS({useMasterKey:true});
		    this.picture = imageFile.ipfs();
     	}
     	
     	if (!this.picture) {
				this.picture = this.profile.picture;
			}
			if (!this.heroPicture) {
				this.heroPicture = this.profile.hero_picture;
			}

		} catch (err) {
			console.log(err)
		}

		try {
			const response = await this.walletService.updProfileData(
				this.address,
				this.picture,
				this.heroPicture,
				this.profile.username,
				this.profile.description,
				this.profile.twitter,
				this.profile.instagram,
				this.profile.email,
				this.profile.tiktok,
				this.profile.twitch
			);
			window.location.reload();
		} catch (e) {
			alert('error: ' + e.data);
		}
	}

	async loadData() {
		this.profile = await this.walletService.getFullProfile(this.address);
		if (!!this.profile.picture) this.imageObject.push({ image: this.profile.picture });
		this.myCards = null;
		this.myCardsFiltered = null;
		this.otherNfts = null;
		this.pendingAuctions = null;
		this.digiBalance = '...';
		this.stableBalance = '...';
		this.activityHistory = null;
		this.isYourProfile = false;
		this.checkYourProfile();
		await this.checkNetwork();
		await this.loadNFTs();
		this.loading = false;
		this.loadActivityHistory();
		
	}

	async changeFilter(): Promise<void> {
		this.loading = true;
		if (this.typeFilter === 'ALL') {
			this.myCardsFiltered = this.myCards;
			this.loading = false;
			return;
		}
		if (this.typeFilter === 'MATIC' || this.typeFilter === 'BSC' || this.typeFilter === 'ETH') {
			const filteredList = [];
			this.myCards.map((item) => {
				if (item.network === this.typeFilter) filteredList.push(item);
			});
			this.myCardsFiltered = filteredList;
			this.loading = false;
			return;
		}

		if (this.typeFilter === 'DIGICUBES') {
			for(let i = 0; i < this.myCards.length; i++){
			
			}
			this.loading = false;
			return;
		}

		if (this.typeFilter === 'PHYSICAL') {
			const filteredList = [];
			this.myCards.map((item) => {
				if (typeof item.tokenData?.attributes?.length === 'number') {
					item.tokenData?.attributes?.map((aItem) => {
						if (aItem.trait_type === 'Physically Backed' && aItem.value === 'Yes') filteredList.push(item);
					})
				}
			});
			this.myCardsFiltered = filteredList;
			this.loading = false;
			return;
		}

		if (this.typeFilter === 'DIGITAL') {
			const filteredList = [];
			this.myCards.map((item) => {
				let flag = 0;
				if (typeof item.tokenData?.attributes?.length === 'number') {
					item.tokenData?.attributes?.map((aItem) => {
						if (aItem.trait_type === 'Physically Backed' && aItem.value === 'Yes') flag = 1;
					});
				}				
				if (flag === 0) filteredList.push(item);
			});
			this.myCardsFiltered = filteredList;
			this.loading = false;
			return;
		}
			
		if (this.typeFilter === 'ALPHABETICAL') {
			this.myCardsFiltered = [
				...(await this.moralis.getAllNFTsByWalletAddressAndNetwork(this.address, this.network)),
				...this.maticNfts,
			];
			this.loading = false;
			return;
		}
	}

	closeEventHandler(): void {
    this.showZoomImage = false;
  }
  
	truncate(fullStr, strLen, separator) {
		if (fullStr.length <= strLen) return fullStr;

		separator = separator || '...';

		var sepLen = separator.length,
			charsToShow = strLen - sepLen,
			frontChars = Math.ceil(charsToShow / 2),
			backChars = Math.floor(charsToShow / 2);

		return (
			fullStr.substr(0, frontChars) +
			separator +
			fullStr.substr(fullStr.length - backChars)
		);
	}

	async loadActivityHistory(): Promise<void> {
		const transactions = await this.moralis.getNFTTransfers(this.address);
		/* const lastBuysMatic = (await this.marketplace.lastBuys(this.address, 5, 'MATIC')).map(
			(bid: any) => {
				console.log(bid);
				bid.action = 'buy';
				return bid;
			}
		); */
		/* const lastBuysEth = (await this.marketplace.lastBuys(this.address, 5, 'ETH')).map(
			(bid: any) => {
				bid.action = 'buy';
				return bid;
			}
		); */
		/* lastBuysMatic.map((buy) => {
			buy.network = 'MATIC'
			buy.isDigi = buy.tokenAddress.toLowerCase() === environment.nftAddressMatic.toLowerCase();
		}); */
		/* lastBuysEth.map((buy) => {
			buy.network = 'ETH'
			buy.isDigi = buy.tokenAddress.toLowerCase() === environment.nftAddress.toLowerCase();
		}); */

		// const lastBidsMatic = (
		//   await this.nft.getLastBidsByUser(this.address, 5, 'MATIC')
		// ).map((bid: any) => {
		//   bid.action = 'bid';
		//   return bid;
		// });
		// lastBidsMatic.map(async (bid) => {
		//   bid.isDigi = true;
		//   bid.network = 'MATIC';
		//   bid.tokenId = (
		//     await this.nft.getAuctionById(bid.auctionId, 'MATIC')
		//   ).tokenId;
		// });
		/* const lastBidsEth = (await this.nft.getLastBidsByUser(this.address, 5, 'ETH')).map(
			(bid: any) => {
				bid.action = 'bid';
				return bid;
			}
		);
		lastBidsEth.map(async (bid) => {
			bid.isDigi = true;
			bid.network = 'ETH'
			bid.tokenId = (await this.nft.getAuctionById(bid.auctionId, 'MATIC')).tokenId;
		}); */

		// let lastBuyNowsEth = [];
		let lastBuyNowsMatic = [];

		try {
			/* lastBuyNowsEth = (
				await this.nft.getLastAuctionBuyNowsByAddress(this.address, 5, 'ETH')
			).map((bid: any) => {
				bid.action = 'buy';
				bid.network = 'ETH'
				bid.isDigi = true;
				return bid;
			}); */
			/*   lastBuyNowsMatic = (
				await this.nft.getLastAuctionBuyNowsByAddress(this.address, 5, 'MATIC')
			).map((bid: any) => {
				bid.action = 'buy';
				bid.network = 'MATIC';
				bid.isDigi = true;
				return bid;
			}); */
		} catch (e) {
			console.log(e);
		}

		this.activityHistory = [...transactions.result].sort(
			(a, b) => (a.created > b.created && -1) || 1
		);
		this.cdr.detectChanges();
	}

	async checkYourProfile(): Promise<void> {
		if (!(await this.walletService.getAccount())) {
			return;
		}
		this.isYourProfile = this.address.toLowerCase() ===	(await this.walletService.getAccount()).toLowerCase();
		if (this.isYourProfile) this.loadPendingAuctions();
		await this.digitrack.isWalletDigiSafe(this.address).then((res) => {
			this.isDigisafe = res;
		});
		
		
		const res = await this.offchain.getUsedCode(this.address);
		if (res.isExist) this.myCode = res.data;
		else {
			var usedCodes = Object.entries(res.data).map((item) => item[1].toString());
			var newCode = this.encodeAddress(this.address, usedCodes)
			this.myCode = newCode.toLocaleUpperCase();
			const createUsedCodeFlag = await this.offchain.setUsedCode(this.address, this.myCode);
			if (!createUsedCodeFlag) {
				console.log('duplicate used code');
			}
		}
	}

	async loadPendingAuctions(): Promise<void> {
		this.pendingAuctions = await this.nft.pendingAuctions(50, this.network);
		this.cdr.detectChanges();
	}

	async loadAllNFTs(): Promise<void> {
		// Need to write function to check token_address
		// prop on returned objects and pass it to API to get Data
		const cardList = [];
		for (let i = 0; i < this.myCards.length; i++) {
			cardList.push(
				await this.offchain.getNftData(
					this.myCards[i].id,
					this.myCards[i].network,
					this.myCards[i].token_address
				)
			);
		}
		this.myCardsFiltered = cardList;
		this.myCards = cardList;
	}

	async loadNFTs(): Promise<void> {
		this.maticNfts = [];
		try {
			let res = await this.moralis.getAllNFTsByWalletAddressAndNetwork(this.address, 'MATIC');
			this.myCards = res;
			console.log(res, 'matic');
			res = await this.moralis.getAllNFTsByWalletAddressAndNetwork(this.address, 'BSC');
			if (res.length > 0) {
				this.myCards.push(...res);
			}
			console.log(res, res.length, 'bsc');

			this.myCardsFiltered = this.myCards;
			console.log(this.myCardsFiltered, 'myCardsFilterd');
		} catch (e) {
			console.error(e);
		}
	}

	async onChangeInputAddress(): Promise<void> {
		this.tokenName = null;
		if (!this.walletService.getWeb3().utils.isAddress(this.inputAddress)) {
			console.log('Invalid address');
			return;
		}

		this.tokenName = '...';
		this.tokenName = await this.nft.getExternalNftName(this.inputAddress);
	}

	async addToken(): Promise<void> {
		if (this.tokenName && this.tokenName !== '...') {
			this.tokens.addToken(this.inputAddress);
			this.addTokenModal.nativeElement.click();
			this.loadData();
			return;
		}
	}

	async loadBalances(): Promise<void> {
		let readOnly = false;
		if ((await this.walletService.getNetwork()) === Network.UNSUPPORTED) {
			readOnly = true;
		}
		this.nft.digiBalance(this.address, readOnly).then((balance) => {
			this.digiBalance = this.math.toHumanValue(balance + '', 18) + '';

			this.cdr.detectChanges();
		});
		this.nft.stableBalance(this.address, readOnly).then((balance) => {
			this.stableBalance = this.math.toHumanValue(balance + '') + '';
			this.cdr.detectChanges();
		});
	}

 /*  loadPendingTransfersFromMatic(): void {
		this.pendingTransfersFromMatic = this.matic.loadTransferHash();
	} */

	/* async completeTransferFromMatic(hash: string): Promise<void> {
		this.loading = true;
		await this.matic.claimTransferredFromMatic(hash);
		window.location.reload();
	} */

	async cancel(auctionId: number, network: string): Promise<void> {
		this.loading = true;
		try {
			await this.market.cancel(auctionId, network);
		} catch (e) {}
		this.loading = false;
		this.loadData();
	}

	async claim(auctionId: number, network: string): Promise<void> {
		this.loading = true;
		try {
			await this.nft.claim(auctionId, network);
		} catch (e) {}
		this.loading = false;
		this.loadData();
	}

	async checkNetwork(): Promise<void> {
		this.walletService.getNetwork().then((network: Network) => {
			if (network === Network.ETH) {
				this.network = 'ETH';
			} else if (network === Network.MATIC) {
				this.network = 'MATIC';
			} else if (network === Network.BSC) {
				this.network = 'BSC';
			} else {
				this.network = 'Invalid';
			}
			this.cdr.detectChanges();
		});
	}

	switchToMatic(): void {
		this.walletService.switchToMatic();
	}

	// ENCODE ADDRESS:
	encodeAddress(address: string, usedCodes: string[])
	{
		const newCode = this.math.encodeAddress(address, usedCodes);
		return newCode;
	}
}

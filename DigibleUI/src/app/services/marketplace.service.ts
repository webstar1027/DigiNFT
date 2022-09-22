import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DigiCard } from '../types/digi-card.types';
import { MathService } from './math.service';
import { VerifiedWalletsService } from './verified-wallets.service';
import { WalletService } from './wallet.service';
import { NftService } from './nft.service';

@Injectable()
export class MarketplaceService {
  MAX_INT = BigInt(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  );

  private marketplaceAddressMatic = environment.digiAuctionAndMarketPlaceMatic;
  private marketplaceAddressEth = environment.digiAuctionAndMarketPlaceEth;

  currentAccount: string;

  constructor(
    private readonly wallet: WalletService,
    private readonly nft: NftService,
    private readonly math: MathService,
    private readonly verifiedProfiles: VerifiedWalletsService
  ) {}

  async buy(saleId: number, network: string): Promise<void> {
    console.log(saleId, network);
    
    const from = await this.getAccount();
    await (await this.getMarketplaceContract(false, network)).methods
      .buy(saleId)
      .send({ from });
  }

  async cancelSale(saleId: number, network: string): Promise<void> {
    const from = await this.getAccount();
    await (await this.getMarketplaceContract(false, network)).methods
      .cancelSale(saleId)
      .send({ from });
  }

  async createSale(
    tokenId: number,
    tokenAddress: string,
    price: string,
    duration: number,
    network: string,
    currencyAddress: string
  ): Promise<number> {
    const from = await this.getAccount();
    // const contract = await this.getMarketplaceContract(false, network);
    return await (await this.getMarketplaceContract(false, network)).methods
      .createSaleAnyCurrency(
        tokenId,
        tokenAddress,
        price,
        duration,
        currencyAddress
      )
      .send({ from });
  }

  async checkAllowedForSale(
    contractAddress: string,
    network: string,
    currency?: string
  ): Promise<number> {
    const account = await this.getAccount();
    const contract = await this.nft.getCurrencyContract(
      currency,
      network,
      true
    );
    return await contract.methods.allowance(account, contractAddress).call();
  }

  async getFee(network: string): Promise<number> {
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
    return parseInt(
      (
        await (await this.getMarketplaceContract(true, network)).methods
          .royaltiesByTokenByContractAddress(tokenAddress, tokenId)
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
    const from = await this.getAccount();
    return await (await this.getMarketplaceContract(false, network)).methods
      .setRoyaltyforTokenAny(tokenId, beneficiary, fee, tokenAddress)
      .send({ from });
  }

  async hasRoyalty(
    tokenAddress: string,
    tokenId: number,
    network: string,
    owner?: string
  ): Promise<boolean> {
    if (owner) {
      const wallet = (
        await (await this.getMarketplaceContract(true, network)).methods
          .royaltiesByTokenByContractAddress(tokenAddress, tokenId)
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
          .royaltiesByTokenByContractAddress(tokenAddress, tokenId)
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
    price: string;
    buyed: boolean;
    endDate: string;
    available: boolean;
    saleId: number;
  }> {
    let saleId;
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

  async getSaleById(
    saleId: number,
    network: string
  ): Promise<{
    tokenId: string;
    tokenAddress: string;
    owner: string;
    price: string;
    buyed: boolean;
    endDate: string;
    available: boolean;
  }> {
    console.log(network);
    const date = new Date();
    const sale = await (await this.getMarketplaceContract(true, 'MATIC')
    ).methods
      .sales(saleId)
      .call();
      console.log(sale);
      sale.available = !sale.buyed && date.getTime() / 1000 < parseInt(sale.endDate, undefined);
      if(sale.buyed) {
        sale.available = false;
      }
    return sale;
  }

  async lastSells(
    tokenId: string,
    tokenAddress: string,
    network: string
  ): Promise<
    { amount: string; created: number; wallet: string; username: string }[]
  > {
    const market = await await this.getMarketplaceContract(true, network);

    return new Promise(async (resolve, reject) => {
      await market.getPastEvents(
        'Bought',
        {
          filter: { tokenId, tokenAddress },
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
    const market = await this.getMarketplaceContract(true, network);
    return new Promise(async (resolve, reject) => {
      await market.getPastEvents(
        'Bought',
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

  async getItemsForSale(limit: number, offset?: number) {
    return [
      ...(await this.getItemsForSaleOnMatic(limit, offset)),
      /* ...(await this.getLastEthAuctions(limit, offset)) */
    ].sort(() => Math.random() - 0.5);
  }

  async getItemsForSaleOnMatic(limit: number, offset?: number): Promise<DigiCard[]> {
    if (!offset) {
      offset = 0;
    }
    limit = limit + offset;
    const market = await this.getMarketplaceContract(true, 'MATIC');
    const total = parseInt(await market.methods.salesCount().call(), undefined);
    console.log('TOTAL FOR SALE:', total);
    
    if (total === 0) {
      return [];
    }
    const cards: DigiCard[] = [];

    for (let i = 0; i < total; i++) {      
      if (i > total) {
        break;
      }

      let sale;
      try {
        sale = await this.getSaleById(i, 'MATIC');
      } catch (e) {
        console.log(e);
      }
      if (!sale.available) {
        continue;
      }
      let found = false;
      for (const card of cards) {
        if (parseInt(sale.tokenId, undefined) === card.id) {
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
        id: parseInt(sale.tokenId, undefined),
        auction: false,
        auctionOrSaleData: sale,
        forSale: true,
        price: this.math.toHumanValue(sale.price, 18),
        nftAddress: sale.tokenAddress,
        network: 'MATIC',
      });
    }
    return cards;
  }

  getMarketplaceAddress(network: string): string {
    if (network === 'ETH') {
      return this.marketplaceAddressEth;
    } else if (network === 'MATIC') {
      return this.marketplaceAddressMatic;
    }
  }

  getAuctionAddress(network: string): string {
    if (network === 'ETH') {
      return environment.digiAuctionAndMarketPlaceEth;
    } else if (network === 'MATIC') {
      return environment.digiAuctionAndMarketPlaceMatic;
    }
  }


  private async getMarketplaceContract(
    readonly: boolean,
    network: string
  ): Promise<any> {
    const abi = require('../../assets/abis/marketplace.json');
    if (readonly) {
      if (network === 'ETH') {
        return new (this.wallet.getInfuraWeb3().eth.Contract)(
          abi,
          this.marketplaceAddressEth
        );
      } else if (network === 'MATIC') {
        return new (this.wallet.getMaticInfuraWeb3().eth.Contract)(
          abi,
          this.marketplaceAddressMatic
        );
      }
    } else {
      return new (this.wallet.getWeb3().eth.Contract)(
        abi,
        this.getMarketplaceAddress(network)
      );
    }
  }

  private async getAccount(): Promise<string | null> {
    if (!this.currentAccount) {
      this.currentAccount = await this.wallet.getAccount();
    }
    return this.currentAccount;
  }
}

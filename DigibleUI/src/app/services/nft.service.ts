import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DigiCard } from '../types/digi-card.types';
import { MarketCard } from '../types/market-card.types';
import { Network } from '../types/network.enum';
import { PendingDigiCard } from '../types/pending-digi-card.types';
import { MathService } from './math.service';
import { VerifiedWalletsService } from './verified-wallets.service';
import { MoralisService } from './moralis.service';
import { OffchainService } from './offchain.service';
import { WalletService } from './wallet.service';
import { Receipt } from '../types/mint.types';
import { Moralis } from 'moralis';
import { DigiService } from './digi.service';

@Injectable()
export class NftService {
  MAX_INT = BigInt(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  );
  private ipfsBaseUri = environment.ipfsBaseUri;

  private nftAddress = environment.nftAddress;
  private nftAddressMatic = environment.nftAddressMatic;
  private nftBulkMintAddress = environment.nftBulkMintAddress;
  private nftBulkMintAddressMatic = environment.nftBulkMintAddressMatic;
  private digiAddressEth = environment.ethCoinContractAddresses.digiEthAddress;
  private digiAddressMatic = environment.maticCoinContractAddresses.digiAddressMatic;
  private digiAddressBsc = environment.bscCoinContractAddresses.digiBSCAddress;
  private auctionAddressMatic = environment.digiAuctionAndMarketPlaceMatic;
  private auctionAddressBsc = environment.digiAuctionAndMarketPlaceBSC;
  private auctionAddressEth = environment.digiAuctionAndMarketPlaceEth;
  private nftCubesAddressMatic = environment.nftCubesAddressMatic;
  private nftKeysAddressMatic = environment.nftKeysAddressMatic;
  currentAccount: string;

  constructor(
    private readonly wallet: WalletService,
    private readonly moralis: MoralisService,
    private readonly math: MathService,
    private readonly verifiedProfiles: VerifiedWalletsService,
    private readonly offchain: OffchainService,
    private readonly digiService: DigiService,
  ) {}


  

async burn(network: string, nftAddress: string, tokenId: string) {

  const from = await this.getAccount();
  console.log("BURNING", nftAddress, tokenId);
  return await (await this.getNftContractByAddressAndNetwork(nftAddress, network)).methods
    .transferFrom(from, '0x000000000000000000000000000000000000dEaD', tokenId)
    .send({ from });

}

  async transfer(tokenId: number, receiver: string): Promise<void> {
    const _from = await this.getAccount();
    await (await this.getNftContract()).methods
      .transferFrom(_from, receiver, tokenId)
      .send({ _from });
  }

  async mintByNftContract(
    receiver: string,
    cardName: string,
    cardImage: string,
    cardPhysical: boolean,
    tokenUri: string,
    network: string,
    nftContractAddress: string
  ): Promise<Receipt> {
    const from = await this.getAccount();
    try {
      let contract;
     
     contract = await this.getNftContractByAddressAndNetwork(nftContractAddress, network);
     
      console.log(receiver, cardName, cardImage, cardPhysical, tokenUri, 'params');
      const response = await contract.methods
        .mint(receiver, cardName, cardImage, cardPhysical, tokenUri)
        .send({ from: from });

      return response;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async mint(
    receiver: string,
    cardName: string,
    cardImage: string,
    cardPhysical: boolean,
    tokenUri: string,
    network: string
  ): Promise<Receipt> {
    const from = await this.getAccount();
    try {
      let contract;
      if (network === 'ETH') {
        contract = await this.getNftContract();
      } else if (network === 'MATIC') {
        contract = await this.getNftContract(false, true);
      } else if (network == 'BSC'){
        contract = await this.getNftContractByAddressAndNetwork(this.digiService.getDigiNFTPublicMintContractAddressByNetwork(network), network);
      }
      console.log(receiver, cardName, cardImage, cardPhysical, tokenUri, 'params');
      const response = await contract.methods
        .mint(receiver, cardName, cardImage, cardPhysical, tokenUri)
        .send({ from: from });

      return response;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async bulkMintByNftContract(
    receiver: string,
    nftData: NftData[],
    network: string,
    nftContractAddress: string
  ) {
    const from = await this.getAccount();
    
    
    const bulkContract = await this.getBulkMintContractByNetwork(network);
    console.log(bulkContract);
    const cardName = [], cardImage = [], cardPhysical = [], tokenUri = [], qtyMint = [];

    console.log(nftData, 'nftData');
    nftData.map((item) => {
      cardName.push(item.name);
      cardImage.push(item.image.replace(this.ipfsBaseUri, ''));
      cardPhysical.push(item.physical);
      tokenUri.push(item.tokenUri.replace(this.ipfsBaseUri, ''));
      qtyMint.push(item.qty);
    })

    var estimateGas = await bulkContract.methods.bulkMint(receiver, cardName, cardImage, cardPhysical, tokenUri, nftContractAddress, this.ipfsBaseUri, qtyMint).estimateGas({ from: from });
    if(network == 'MATIC'){
      estimateGas+=4500000
    }
   
    const response = await bulkContract.methods
      .bulkMint(receiver, cardName, cardImage, cardPhysical, tokenUri, nftContractAddress, this.ipfsBaseUri, qtyMint)
      .send({ from: from, gas: estimateGas});

    return response;
  }

  async bulkMint(
    receiver: string,
    nftData: NftData[],
    network: string,
  ) {
    const from = await this.getAccount();
    
    const nbuContract =  this.digiService.getDigiNFTPublicMintContractAddressByNetwork(network);
    const bulkContract = await this.getBulkMintContractByNetwork(network);
    console.log(bulkContract);
    const cardName = [], cardImage = [], cardPhysical = [], tokenUri = [], qtyMint = [];

    console.log(nftData, 'nftData');
    nftData.map((item) => {
      cardName.push(item.name);
      cardImage.push(item.image.replace(this.ipfsBaseUri, ''));
      cardPhysical.push(item.physical);
      tokenUri.push(item.tokenUri.replace(this.ipfsBaseUri, ''));
      qtyMint.push(item.qty);
    })

    var estimateGas = await bulkContract.methods.bulkMint(receiver, cardName, cardImage, cardPhysical, tokenUri, nbuContract, this.ipfsBaseUri, qtyMint).estimateGas({ from: from });
    if(network == 'MATIC'){
      estimateGas+=4500000
    }
   
    const response = await bulkContract.methods
      .bulkMint(receiver, cardName, cardImage, cardPhysical, tokenUri, nbuContract, this.ipfsBaseUri, qtyMint)
      .send({ from: from, gas: estimateGas});

    return response;
  }

  async isAdmin(account?: string): Promise<boolean> {
    let from;
    if (account) {
      from = account;
    } else {
      from = await this.getAccount();
    }
    if (!from) {
      return false;
    }
    const adminRole =
      '0x0000000000000000000000000000000000000000000000000000000000000000';
    return await (await this.getNftContract(true)).methods
      .hasRole(adminRole, from)
      .call();
  }

  async grantMinterRole(account: string): Promise<void> {
    const minterRole =
      '0xf0887ba65ee2024ea881d91b74c2450ef19e1557f03bed3ea9f16b037cbe2dc9';
    return await (await this.getNftContract()).methods
      .grantRole(minterRole, account)
      .send({ from: await this.getAccount() });
  }

  async revokeMinterRole(account: string): Promise<void> {
    const minterRole =
      '0xf0887ba65ee2024ea881d91b74c2450ef19e1557f03bed3ea9f16b037cbe2dc9';
    return await (await this.getNftContract()).methods
      .revokeRole(minterRole, account)
      .send({ from: await this.getAccount() });
  }

  async getAuctionIdByToken(
    tokenId: number,
    network: string,
    tokenAddress: boolean
  ): Promise<number | null> {
    let auction;
    try {
      auction = parseInt(
        await (await this.getAuctionContract(true, network)).methods
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
    console.log("NFT SERV DB " + auctionId);
    const from = await this.getAccount();
    await (await this.getAuctionContract(true, network)).methods
      .directBuy(auctionId)
      .send({ from: from });
  }

  async getFee(network: string): Promise<number> {
    return parseInt(
      await (await this.getAuctionContract(true, network)).methods
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
        await (await this.getAuctionContract(true, network)).methods
          .royaltiesByTokenByContract(tokenAddress, tokenId)
          .call()
      ).fee,
      undefined
    );
  }

  async cancel(auctionId: number, network: string): Promise<void> {
    const from = await this.getAccount();
    await (await this.getAuctionContract(false, network)).methods
      .cancel(auctionId)
      .send({ from });
  }

  async hasRoyalty(
    tokenId: number,
    network: string,
    contractAddress: string,
    owner?: string
  ): Promise<boolean> {
    if (owner) {
      if (network === 'ETH') {
        const wallet = (
          await (await this.getAuctionContract(true, 'ETH')).methods
            .royaltiesByTokenByContract(contractAddress, tokenId)
            .call()
        ).wallet;

        return (
          wallet !== '0x0000000000000000000000000000000000000000' &&
          wallet !== owner
        );
      } else if (network === 'MATIC') {
        const wallet = (
          await (await this.getAuctionContract(true, 'MATIC')).methods
            .royaltiesByTokenByContract(contractAddress, tokenId)
            .call()
        ).wallet;

        return (
          wallet !== '0x0000000000000000000000000000000000000000' &&
          wallet !== owner
        );
      }
    } else {
      if (network === 'ETH') {
        return (
          (
            await (await this.getAuctionContract(true, 'ETH')).methods
              .royaltiesByTokenByContract(contractAddress, tokenId)
              .call()
          ).wallet !== '0x0000000000000000000000000000000000000000'
        );
      } else if (network === 'MATIC') {
        return (
          (
            await (await this.getAuctionContract(true, 'MATIC')).methods
              .royaltiesByTokenByContract(contractAddress, tokenId)
              .call()
          ).wallet !== '0x0000000000000000000000000000000000000000'
        );
      }
    }
  }

  async createAuction(
    tokenId: number,
    minPrice: string,
    fixedPrice: string,
    duration: number,
    network: string,
    paymentCurrency: string,
    tokenAddress?: string
  ): Promise<void> {
    const from = await this.getAccount();
    let nftContractAddress;

    if (network === 'ETH') {
      nftContractAddress = environment.nftAddress;
    } else if (network === 'MATIC') {
      nftContractAddress = environment.nftAddressMatic;
    }

    if (tokenAddress) {
      nftContractAddress = tokenAddress;
    }

    try {
      const contract = await this.getAuctionContract(false, network);
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
          console.log(receipt, 'create auction once');
          this.offchain.createSaleData(receipt.events?.CreatedAuction?.returnValues?.saleId, network);
        });
      return response;
    } catch (e) {
      console.log('createAuction ERROR ::', e);
      return e;
    }
  }

  async claim(auctionId: number, network: string): Promise<void> {
    const from = await this.getAccount();
    await (await this.getAuctionContract(false, network)).methods
      .claim(auctionId)
      .send({ from });
  }

  async getAuctionById(
    auctionId: number,
    network: string
  ): Promise<{
    buyed: boolean;
    endDate: string;
    fixedPrice: string;
    minPrice: string;
    owner: string;
    tokenId: string;
    available: boolean;
    isAuction: boolean;
    nftContractAddress: string;
  }> {
    const date = new Date();
    let auction;
    try {
      auction = await (await this.getAuctionContract(true, network)).methods
        .sales(auctionId)
        .call();
      auction.available =
        !auction.buyed &&
        date.getTime() / 1000 < parseInt(auction.endDate, undefined);
    } catch (e) {
      console.log('getAuctionById ERROR ::', e);
    }
    return auction;
  }

  async isClaimed(auctionId: number, network: string): Promise<boolean> {
    return await (await this.getAuctionContract(true, network)).methods
      .claimedAuctions(auctionId)
      .call();
  }

  async getLastAuctionPrices(
    tokenId: number,
    limit: number,
    network: string
  ): Promise<
    { amount: string; wallet: string; created: number; username: string }[]
  > {
    let fromBlock;
    if (network === 'MATIC') {
      fromBlock =
        (await this.wallet.getMaticInfuraWeb3().eth.getBlockNumber()) -
        environment.blocksInEvents;
    } else if (network === 'ETH') {
      fromBlock =
        (await this.wallet.getInfuraWeb3().eth.getBlockNumber()) -
        environment.blocksInEvents;
    }
    return new Promise(async (resolve, reject) => {
      await (
        await this.getAuctionContract(true, network)
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

  async getLastAuctionBuyNows(
    tokenId: number,
    limit: number,
    network: string
  ): Promise<
    { amount: string; wallet: string; created: number; username: string }[]
  > {
    let fromBlock;
    if (network === 'MATIC') {
      fromBlock =
        (await this.wallet.getMaticInfuraWeb3().eth.getBlockNumber()) -
        environment.blocksInEvents;
    } else if (network === 'ETH') {
      fromBlock =
        (await this.wallet.getInfuraWeb3().eth.getBlockNumber()) -
        environment.blocksInEvents;
    }

    return new Promise(async (resolve, reject) => {
      await (
        await this.getAuctionContract(true, network)
      ).getPastEvents(
        'DirectBuyed',
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

  async getLastAuctionBuyNowsByAddress(
    wallet: string,
    limit: number,
    network: string
  ): Promise<
    { amount: string; wallet: string; created: number; username: string }[]
  > {
    let fromBlock;
    if (network === 'MATIC') {
      fromBlock =
        (await this.wallet.getMaticInfuraWeb3().eth.getBlockNumber()) -
        environment.blocksInEvents;
    } else if (network === 'ETH') {
      fromBlock =
        (await this.wallet.getInfuraWeb3().eth.getBlockNumber()) -
        environment.blocksInEvents;
    }
    return new Promise(async (resolve, reject) => {
      await (
        await this.getAuctionContract(true, network)
      ).getPastEvents(
        'DirectBuyed',
        {
          filter: {
            wallet,
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

  async getHighestOffer(auctionId: number, network: string) {
    const contract = await this.getAuctionContract(true, network);
    const array = [];
    array.push(await contract.methods.highestOffers(auctionId).call());
    return array;
  }

  async getLastBids(
    auctionId: number,
    limit: number,
    network: string
  ): Promise<{ amount: string; wallet: string; created: number }[]> {
    console.log(auctionId, limit, network);
    
    return new Promise(async (resolve, reject) => {
      let logs, chunks;
      chunks = 10000; // Even 10,000 chunks have a few segments that error out
      logs = [];
      for (let i = 0; i < 10000000; i += chunks) {
        await (
          await this.getAuctionContract(true, network)
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
              console.log(events);
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
    let fromBlock;
      fromBlock = (await this.wallet.getWeb3ByNetwork(network).eth.getBlockNumber()) -
        environment.blocksInEvents;
    return new Promise(async (resolve, reject) => {
      let logs, chunks;
      chunks = 3500; // Even 10,000 chunks have a few segments that error out
      logs = [];
      for (let i = 0; i < 10000000; i += chunks) {
        await (
          await this.getAuctionContract(true, network)
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
    const auctions = await this.getAuctionContract(true, network);
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
  ): Promise<DigiCard[]> {
    if (!offset) {
      offset = 0;
    }
    limit = limit + offset;
    const contract = await this.getAuctionContract(true, 'ETH');
    const total = parseInt(
      await contract.methods.salesCount().call(),
      undefined
    );
    if (total === 0) {
      return [];
    }

    const digiCards: DigiCard[] = [];
    for (
      let auctionId = total - offset;
      auctionId > total - limit;
      auctionId--
    ) {
      if (auctionId < 0) {
        break;
      }
      const auction = await this.getAuctionById(auctionId, 'ETH');
      if (!auction.available) {
        continue;
      }
      if (
        environment.deletedNfts.indexOf(
          parseInt(auction.tokenId, undefined)
        ) !== -1
      ) {
        continue;
      }
      const price = (await this.getAuctionPrice(auctionId, auction, 'ETH'))
        .price;
      digiCards.push({
        id: parseInt(auction.tokenId, undefined),
        auction: true,
        price: this.math.toHumanValue(price),
        network: 'ETH',
      });
    }
    return digiCards;
  }

  async getLastMaticAuctions(
    limit: number,
    offset?: number
  ): Promise<DigiCard[]> {
    if (!offset) {
      offset = 0;
    }
    limit = limit + offset;
    const contract = await this.getAuctionContract(true, 'MATIC');
    const total = parseInt(
      await contract.methods.salesCount().call(),
      undefined
    );

    if (total === 0) {
      return [];
    }

    const digiCards: DigiCard[] = [];
    for (
      let auctionId = total - offset;
      auctionId > total - limit;
      auctionId--
    ) {
      if (auctionId < 0) {
        break;
      }
      const auction = await this.getAuctionById(auctionId, 'MATIC');

      if (!auction.isAuction) {
        continue;
      }

      if (!auction.available) {
        continue;
      }
      if (
        environment.deletedNfts.indexOf(
          parseInt(auction.tokenId, undefined)
        ) !== -1
      ) {
        continue;
      }
      const price = (await this.getAuctionPrice(auctionId, auction, 'MATIC'))
        .price;
      digiCards.push({
        id: parseInt(auction.tokenId, undefined),
        auction: true,
        forSale: false,
        auctionOrSaleData: auction,
        price: this.math.toHumanValue(price),
        network: 'MATIC',
        nftAddress: auction.nftContractAddress,
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
  ): Promise<PendingDigiCard[]> {
    const auctions = await this.getAuctionContract(true, network);
    const account = await this.getAccount();
    const total = parseInt(
      await auctions.methods.salesCount().call(),
      undefined
    );
    if (total === 0) {
      return [];
    }

    const digiCards: PendingDigiCard[] = [];

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
          (offer.winner !== '0x0000000000000000000000000000000000000000' ||
            auction.buyed);
        if (!sold) {
          const nftData: any = await this.moralis.getNftDataFromMoralis(
            auction.nftContractAddress,
            auction.tokenId,
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
          id: parseInt(auction.tokenId, undefined),
          auctionId,
          seller: auction.owner === account,
          sold,
          network: network,
          nftAddress: auction.nftContractAddress,
          pendingAuction: true,
        };

        digiCards.push(card);
      }
    }
    return digiCards;
  }

  async getExternalNftName(nftAddress: string): Promise<string> {
    const abi = require('../../assets/abis/erc721.json');
    const nft = new (this.wallet.getWeb3().eth.Contract)(abi, nftAddress);
    return await nft.methods.name().call();
  }

  async getExternalNftUri(
    nftAddress: string,
    tokenId: number
  ): Promise<string> {
    const abi = require('../../assets/abis/erc721.json');
    const nft = new (this.wallet.getWeb3().eth.Contract)(abi, nftAddress);
    return await nft.methods.tokenURI(tokenId).call();
  }

  async getBurnTransaction(tokenId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await (
        await this.getNftContract(true)
      ).getPastEvents(
        'Transfer',
        {
          filter: {
            tokenId,
            to: '0x000000000000000000000000000000000000dEaD',
          },
          fromBlock: 0,
          toBlock: 'latest',
        },
        (error, events) => {
          if (error) {
            resolve(error);
          } else {
            resolve(events);
          }
        }
      );
    });
  }

  async applyRoyalty(
    tokenId: number,
    beneficiary: string,
    fee: number,
    network: string,
    tokenAddress: string
  ): Promise<number> {
    const from = await this.getAccount();
    return await (await this.getAuctionContract(false, network)).methods
      .setRoyaltyForToken(tokenAddress, tokenId, beneficiary, fee)
      .send({ from });
  }

  async myNFTs(address: string): Promise<any> {
    let maticChain;
    // let ethChain;
    if (environment.production) {
      maticChain = 'Matic';
      // ethChain = 'Eth'
    } else {
      maticChain = 'mumbai';
      // ethChain = 'kovan'
    }
    const myNFTs = [];
    const getAllMatic = await Moralis.Web3API.account.getNFTs({
      chain: maticChain,
      address: address,
    });
    /* const getAllEth = await Moralis.Web3API.account.getNFTs({
      chain: ethChain,
      address: address,
    });
    console.log(getAllEth.result); */

    const maticNfts = getAllMatic.result.map((item: any) => {
      item.id = item.token_id;
      item.network = 'MATIC';
      item.tokenAddress = item.token_address;
      myNFTs.push(item);
    });
    // console.log(maticNfts);

    /* const ethNfts = getAllEth.result.map((item: any) => {
      item.id = item.token_id;
      item.network = 'ETH';
      myNFTs.push(item);
    }); */
    // console.log(myNFTs);

    return myNFTs;
  }

  async getNewEthNfts(limit: number, offset?: number): Promise<DigiCard[]> {
    if (!offset) {
      offset = 0;
    }
    limit = limit + offset;
    const nft = await this.getNftContract(true);
    const totalSupply = parseInt(
      await nft.methods.totalSupply().call(),
      undefined
    );
    // console.log('ETH TOTAL:', totalSupply);
    const digiCards: DigiCard[] = [];
    for (
      let tokenId = totalSupply - offset;
      tokenId > totalSupply - limit;
      tokenId--
    ) {
      if (tokenId <= 0) {
        break;
      }
      if (environment.deletedNfts.indexOf(tokenId) !== -1) {
        continue;
      }
      digiCards.push({
        id: tokenId,
        network: 'ETH',
      });
    }
    return digiCards;
  }

  async getNewMaticNfts(limit: number, offset?: number): Promise<DigiCard[]> {
    if (!offset) {
      offset = 0;
    }
    limit = limit + offset;
    const nft = await this.getNftContract(true, true);
    const totalSupply = parseInt(
      await nft.methods.totalSupply().call(),
      undefined
    );

    const digiCards: DigiCard[] = [];
    for (
      let tokenId = totalSupply - offset;
      tokenId > totalSupply - limit;
      tokenId--
    ) {
      if (tokenId <= 0) {
        break;
      }
      if (environment.deletedNfts.indexOf(tokenId) !== -1) {
        continue;
      }
      // console.log(environment.nftAddressMatic, tokenId.toString(), 'MATIC');
      digiCards.push({
        id: tokenId,
        nftAddress: environment.nftAddressMatic,
        isSearch: true,
        network: 'MATIC',
      });
    }
    return digiCards;
  }

  async getNftsFromMoralis(): Promise<DigiCard[]> {
    let digiCards: any = [];
    const digiNftsMatic = await Moralis.Web3API.token.getAllTokenIds({
      address: environment.nftAddressMatic,
      chain: 'mumbai',
    });

    digiNftsMatic.result.forEach((element, index) => {
      digiCards.push({
        ...element,
        id: element.token_id,
        network: 'MATIC',
      });
    });
    const digiCubes = await Moralis.Web3API.token.getAllTokenIds({
      address: environment.nftCubesAddressMatic,
      chain: 'mumbai',
    });
    digiCubes.result.forEach((element, index) => {
      digiCards.push({
        ...element,
        id: element.token_id,
        network: 'MATIC',
        isCube: true,
      });
    });
    const digiKeys = await Moralis.Web3API.token.getAllTokenIds({
      address: environment.nftKeysAddressMatic,
      chain: 'mumbai',
    });
    digiKeys.result.forEach((element, index) => {
      digiCards.push({
        ...element,
        id: element.token_id,
        network: 'MATIC',
        isKey: true,
      });
    });
    return digiCards;
  }

  async getNftsForHome() {
    return [
      ...(await this.getNftsFromMoralis()),
      /* ...(await this.getNewEthNfts(limit, offset)), */
    ].sort(() => Math.random() - 0.5);
  }

  async getNewNfts(limit: number, offset?: number) {
    return [
      ...(await this.getNewMaticNfts(limit, offset)),
      /* ...(await this.getNewEthNfts(limit, offset)), */
    ].sort(() => Math.random() - 0.5);
  }

  async getNewDigiCubeNfts(
    limit: number,
    offset?: number
  ): Promise<DigiCard[]> {
    if (!offset) {
      offset = 0;
    }
    limit = limit + offset;
    const abi = require('../../assets/abis/erc721.json');
    let totalSupply: any;
    const maticNftContract =
      new (this.wallet.getMaticInfuraWeb3().eth.Contract)(
        abi,
        this.nftCubesAddressMatic
      );
    totalSupply = parseInt(
      await maticNftContract.methods.totalSupply().call(),
      undefined
    );
    const digiCards: DigiCard[] = [];
    for (
      let tokenId = totalSupply - offset;
      tokenId > totalSupply - limit;
      tokenId--
    ) {
      if (tokenId <= 0) {
        break;
      }
      if (environment.deletedNfts.indexOf(tokenId) !== -1) {
        continue;
      }
      digiCards.push({
        id: tokenId,
        isCube: true,
        network: 'MATIC',
      });
    }
    return digiCards;
  }
  async getNewDigiKeyNfts(limit: number, offset?: number): Promise<DigiCard[]> {
    if (!offset) {
      offset = 0;
    }
    limit = limit + offset;
    const abi = require('../../assets/abis/erc721.json');
    let totalSupply: any;
    const maticNftContract =
      new (this.wallet.getMaticInfuraWeb3().eth.Contract)(
        abi,
        this.nftKeysAddressMatic
      );
    totalSupply = parseInt(
      await maticNftContract.methods.totalSupply().call(),
      undefined
    );

    const digiCards: DigiCard[] = [];
    for (
      let tokenId = totalSupply - offset;
      tokenId > totalSupply - limit;
      tokenId--
    ) {
      if (tokenId <= 0) {
        break;
      }
      if (environment.deletedNfts.indexOf(tokenId) !== -1) {
        continue;
      }
      digiCards.push({
        id: tokenId,
        network: 'MATIC',
      });
    }
    return digiCards;
  }
  async getDigiCubeNfts(limit: number, offset?: number) {
    return [
      ...(await this.getNewDigiCubeNfts(limit, offset)),
      /* ...(await this.getNewEthNfts(limit, offset)), */
    ].sort(() => Math.random() - 0.5);
  }

  async getDigiKeyNfts(limit: number, offset?: number) {
    return [
      ...(await this.getNewDigiKeyNfts(limit, offset)),
      /* ...(await this.getNewEthNfts(limit, offset)), */
    ].sort(() => Math.random() - 0.5);
  }

  async getMaticNfts(): Promise<DigiCard[]> {
    let maticNftContract: any;
    let totalSupply: any;
    maticNftContract = await this.getMaticNftContract(true);
    totalSupply = parseInt(
      await maticNftContract.methods.totalSupply().call(),
      undefined
    );

    totalSupply = Array(totalSupply)
      .fill(0)
      .map((_, i) => (i = i));

    const digiCards: DigiCard[] = [];
    const deletedNfts = new Set([...environment.deletedNfts]);
    let notDeletedNFTs = totalSupply.filter((x) => !deletedNfts.has(x));
    let lastItem = notDeletedNFTs.slice(-1);
    notDeletedNFTs.push(lastItem[0] + 1);
    notDeletedNFTs = notDeletedNFTs.filter(Number);
    notDeletedNFTs.forEach((element, index) => {
      digiCards.push({
        id: element,
        network: 'MATIC',
      });
    });
    return digiCards;
  }

  async getAllEthNfts(): Promise<DigiCard[]> {
    let nft: any;
    let totalSupply: any;
    nft = await this.getEthNftContract();
    totalSupply = parseInt(await nft.methods.totalSupply().call(), undefined);
    totalSupply = Array(totalSupply)
      .fill(0)
      .map((_, i) => (i = i));

    const digiCards: DigiCard[] = [];
    const deletedNfts = new Set([...environment.deletedNfts]);
    let notDeletedNFTs = totalSupply.filter((x) => !deletedNfts.has(x));
    let lastItem = notDeletedNFTs.slice(-1);
    notDeletedNFTs.push(lastItem[0] + 1);
    notDeletedNFTs = notDeletedNFTs.filter(Number);

    notDeletedNFTs.forEach((element, index) => {
      digiCards.push({
        id: element,
        network: 'ETH',
      });
    });
    return digiCards;
  }

  async getAllNfts() {
    const matic = await this.getMaticNfts();
    const eth = await this.getAllEthNfts();
    return [...matic, ...eth].sort(() => Math.random() - 0.5);
  }

  async externalOwner(nftAddress: string, tokenId: number): Promise<string> {
    const abi = require('../../assets/abis/erc721.json');
    const nft = new (this.wallet.getWeb3().eth.Contract)(abi, nftAddress);
    return await nft.methods.ownerOf(tokenId).call();
  }

  // Gets owner of NFT
  /* async owner(
    tokenId: number,
    network: string,
    isCube?: boolean
  ): Promise<{
    address: string;
    network: string;
  }> {
    if (isCube) {
      try {
        return {
          address: await (await this.getCubeContract(true)).methods
            .ownerOf(tokenId)
            .call(),
          network: 'MATIC',
        };
      } catch (e) {
        console.log(e);
      }
    }
    if (!isCube && network === 'MATIC') {
      try {
        return {
          address: await (await this.getNftContract(true, true)).methods
            .ownerOf(tokenId)
            .call(),
          network: 'MATIC',
        };
      } catch (e) {
        console.log(e);
      }
    } else if (!isCube && network === 'ETH') {
      try {
        return {
          address: await (await this.getNftContract(true)).methods
            .ownerOf(tokenId)
            .call(),
          network: 'ETH',
        };
      } catch (e) {
        console.log(e);
      }
    }
  } */

  async isApprovedExternalForAll(
    nftAddress: string,
    owner: string,
    operator: string
  ): Promise<boolean> {
    const abi = require('../../assets/abis/erc721.json');
    const nft = new (this.wallet.getWeb3().eth.Contract)(abi, nftAddress);
    return await nft.methods.isApprovedForAll(owner, operator).call();
  }

  async setApprovalExternalForAll(
    nftAddress: string,
    operator: string
  ): Promise<void> {
    const abi = require('../../assets/abis/erc721.json');
    const nft = new (this.wallet.getWeb3().eth.Contract)(abi, nftAddress);
    await nft.methods
      .setApprovalForAll(operator, true)
      .send({ from: await this.getAccount() });
  }

  async allowance(
    address: string,
    network: string,
    currency?: string
  ): Promise<number> {
    const account = await this.getAccount();
    let contract;
    if (!currency) {
      contract = await this.getStableContract();
    } else {
      contract = await this.getCurrencyContract(currency, network, false);
    }
    return await contract.methods.allowance(account, address).call();
  }

  async isApprovedForAll(
    owner: string,
    operator: string,
    network: string,
    contractAddress: string
  ): Promise<boolean> {
    const contract = await this.getNftContractByAddressAndNetwork(
      contractAddress,
      network
    );
    return await contract.methods.isApprovedForAll(owner, operator).call();
  }

  async setApprovalForAll(
    operator: string,
    network: string,
    contractAddress?: string
  ): Promise<void> {
    const from = await this.getAccount();
    let contract;
    if (network === 'ETH') {
      contract = await this.getNftContract(false, false);
    } else if (network === 'MATIC') {
      contract = await this.getNftContractByAddressAndNetwork(
        contractAddress,
        network
      );
    }
    await contract.methods
      .setApprovalForAll(operator, true)
      .send({ from: from });
  }

  async approve(
    address: string,
    network: string,
    currency: string
  ): Promise<void> {
    const account = await this.getAccount();
    await (await this.getCurrencyContract(currency, network, false)).methods
      .approve(address, this.MAX_INT)
      .send({ from: account });
  }

  async allowedStable(
    amount: number,
    address: string,
    network: string,
    currency: string
  ): Promise<boolean> {
    const allowance = await this.allowedTokenFor(address, network, currency);
    return allowance >= amount * 10 ** 18;
  }

  async allowedTokenFor(
    address: string,
    network: string,
    currency: string
  ): Promise<number> {
    console.log(address, network, currency, 'allowedtokenfor');
    const account = await this.getAccount();
    const contract = await this.getCurrencyContract(currency, network, true);
    console.log(contract, account, address, 'allowance');
    return await contract.methods.allowance(account, address).call();
  }

  async stableBalance(account?: string, readonly?: boolean): Promise<number> {
    if (!account) {
      account = await this.getAccount();
    }

    return await (await this.getStableContract(readonly)).methods
      .balanceOf(account)
      .call();
  }

  async digiBalance(account?: string, readonly?: boolean): Promise<number> {
    if (!account) {
      account = await this.getAccount();
    }

    return await (await this.getDigiContract(readonly)).methods
      .balanceOf(account)
      .call();
  }

  async getNftAddress(readOnly?: boolean): Promise<string> {
    if (!readOnly && (await this.wallet.getNetwork()) === Network.MATIC) {
      return this.nftAddressMatic;
    }
    return this.nftAddress;
  }

  async getNftAddressByNetwork(network: string): Promise<string> {
    if (network === 'MATIC') {
      return this.nftAddressMatic;
    } else if (network === 'ETH') {
      return this.nftAddress;
    }
  }

  async getMaticNftAddress(readOnly?: boolean): Promise<string> {
    return this.nftAddressMatic;
  }

  async getAuctionAddress() {
    const network = await this.wallet.getNetwork();
    if (network === 'MATIC') {
      return this.auctionAddressMatic;
    } else if (network === 'ETH') {
      return this.auctionAddressEth;
    }
  }

  async getAuctionAddressByNetwork(network: string) {
    if (network === 'MATIC') {
      return this.auctionAddressMatic;
    } else if (network === 'ETH') {
      return this.auctionAddressEth;
    }
  }

  async getDigiAddress(): Promise<string> {
    const network = await this.wallet.getNetwork();
    if (network === Network.MATIC) return this.digiAddressMatic;
    if (network === Network.BSC) return this.digiAddressBsc;
    return this.digiAddressEth;
  }

  private async getMaticNftContract(readonly?: boolean): Promise<any> {
    const abi = require('../../assets/abis/erc721.json');
    if (readonly) {
      return new (this.wallet.getMaticInfuraWeb3().eth.Contract)(
        abi,
        this.nftAddressMatic
      );
    } else {
      return new (this.wallet.getWeb3().eth.Contract)(
        abi,
        this.nftAddressMatic
      );
    }
  }

  private async getEthNftContract(readonly?: boolean): Promise<any> {
    const abi = require('../../assets/abis/erc721.json');
    if (readonly) {
      return new (this.wallet.getInfuraWeb3().eth.Contract)(
        abi,
        this.nftAddress
      );
    } else {
      return new (this.wallet.getWeb3().eth.Contract)(abi, this.nftAddress);
    }
  }

  private async getCubeContract(readonly?: boolean): Promise<any> {
    const abi = require('../../assets/abis/erc721.json');
    if (readonly) {
      return new (this.wallet.getMaticInfuraWeb3().eth.Contract)(
        abi,
        this.nftCubesAddressMatic
      );
    } else {
      return new (this.wallet.getWeb3().eth.Contract)(
        abi,
        this.nftCubesAddressMatic
      );
    }
  }

  private async getBulkMintContractByNetwork(
    network: string
  ): Promise<any> {
    
    const abi = require('../../assets/abis/bulkmintNBU.json');
  

  
      return new (this.wallet.getWeb3().eth.Contract)(
        abi,
        this.digiService.getDigiNFTPublicMultiMintContractAddressByNetwork(network),
        
      );
   
  }

  private async getNftContract(
    readonly?: boolean,
    isMatic?: boolean
  ): Promise<any> {
    isMatic = true;
    const abi = require('../../assets/abis/erc721.json');
    if (readonly) {
      if (isMatic) {
        return new (this.wallet.getMaticInfuraWeb3().eth.Contract)(
          abi,
          this.nftAddressMatic
        );
      }
      return new (this.wallet.getInfuraWeb3().eth.Contract)(
        abi,
        this.nftAddress
      );
    }
    if (isMatic) {
      return new (this.wallet.getWeb3().eth.Contract)(
        abi,
        this.nftAddressMatic
      );
    } else {
      return new (this.wallet.getWeb3().eth.Contract)(abi, this.nftAddress);
    }
  }

  private async getNftContractByAddressAndNetwork(
    tokenAddress: string,
    network: string
  ): Promise<any> {
    const abi = require('../../assets/abis/erc721.json');
    return new (this.wallet.getWeb3().eth.Contract)(abi, tokenAddress);
  }

  private async getAuctionContract(
    readonly?: boolean,
    network?: string
  ): Promise<any> {
    const abi = require('../../assets/abis/digimarketandauction.json');
    if (readonly) {
      if (network === 'MATIC') { 
        return new (this.wallet.getMaticInfuraWeb3().eth.Contract)(
          abi,
          this.auctionAddressMatic
        );
      } else if (network === 'ETH') {
        return new (this.wallet.getInfuraWeb3().eth.Contract)(
          abi,
          this.auctionAddressEth
        );
      } else if (network === 'BSC') {
        return new (this.wallet.getBSCWeb3().eth.Contract)(
          abi,
          this.auctionAddressBsc
        );
      }
    } else {
      if (network === 'MATIC') {
        return new (this.wallet.getWeb3().eth.Contract)(
          abi,
          this.auctionAddressMatic
        );
      } else if (network === 'ETH') {
        return new (this.wallet.getWeb3().eth.Contract)(
          abi,
          this.auctionAddressEth
        );
      } else if (network === 'BSC') {
        return new (this.wallet.getBSCWeb3().eth.Contract)(
          abi,
          this.auctionAddressBsc
        );
      }
    }
  }

  async getCurrencyContract(
    currency: string,
    network: string,
    readonly?: boolean
  ): Promise<any> {
    const abi = require('../../assets/abis/erc20.json');
    if (readonly) {
      if (network == 'MATIC') {
        return new (this.wallet.getMaticInfuraWeb3().eth.Contract)(
          abi,
          currency
        );
      }
      if (network == 'ETH') {
        return new (this.wallet.getInfuraWeb3().eth.Contract)(abi, currency);
      }
      if (network == 'BSC') {
        return new (this.wallet.getBSCWeb3().eth.Contract)(abi, currency);
      }
    } else {
      return new (this.wallet.getWeb3ByNetwork(network).eth.Contract)(abi, currency);
    }
  }

  private async getStableContract(readonly?: boolean): Promise<any> {
    const abi = require('../../assets/abis/erc20.json');
    if (readonly) {
      return new (this.wallet.getMaticInfuraWeb3().eth.Contract)(
        abi,
        environment.stableCoinAddress
      );
    }
    return new (this.wallet.getWeb3().eth.Contract)(
      abi,
      environment.stableCoinAddress
    );
  }

  // Gets $DIGI token Contract
  private async getDigiContract(readonly?: boolean): Promise<any> {
    const abi = require('../../assets/abis/erc20.json');
    if (readonly) {
      return new (this.wallet.getMaticInfuraWeb3().eth.Contract)(
        abi,
        this.digiAddressEth
      );
    }
    return new (this.wallet.getWeb3().eth.Contract)(
      abi,
      await this.getDigiAddress()
    );
  }

  private async getAccount(): Promise<string | null> {
    if (!this.currentAccount) {
      this.currentAccount = await this.wallet.getAccount();
    }
    return this.currentAccount;
  }
}

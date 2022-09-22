import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import * as eth721abi from '../abis/eth721.json';
import { Claim } from './dtos/claim.dto';
import { EmailService } from './services/email.service';

@Controller('claim')
export class ClaimController {
  private Web3;

  private readonly eth721Address = '0x4e4e06dfB3aCD27e6a96fEc7458726EEc5b487d0';
  private readonly eth721AddressTestNet =
    '0x4e4e06dfB3aCD27e6a96fEc7458726EEc5b487d0';

  private readonly eth721AddressTestNetMatic =
    '0x2050ebd262Db421De662607A05be26930Edbb8C8';
  private readonly eth721AddressMatic =
    '0x1eA016dcD53bA2EBe9DbD1C0418FF816b6FF9B25';

  constructor(private readonly email: EmailService) {
    this.Web3 = require('web3');
  }

  @Post()
  async claimCard(@Body() body: Claim) {
    const address = this.getWeb3().eth.accounts.recover(
      'Digible - ' + body.tokenId + ' - ' + body.email + ' - ' + body.address,
      body.signature,
    );
    /*if (!(await this.hasBurned(address, body.tokenId))) {
      throw new ForbiddenException('Signed message is not from the burner');
    } */
    if ((await this.owner(body.tokenId)) !== address) {
      throw new ForbiddenException('Signed message is not from the owner');
    }
    const response = await this.email.sendMail(
      process.env.EMAIL_RECEIVER,
      'Digible: Card claimed',
      'User ' +
        body.email +
        ' with wallet ' +
        address +
        ' has claimed the NFT number ' +
        body.tokenId +
        ' to the address ' +
        body.address,
    );
    await this.email.sendMail(
      body.email,
      'Digible: Card claimed',
      'We received your petition for the NFT number ' +
        body.tokenId +
        ' to the address ' +
        body.address,
    );
    return {
      status: response,
    };
  }

  private async owner(tokenId: number): Promise<string> {
    try {
      return await (await this.getMaticContract()).methods
        .ownerOf(tokenId)
        .call();
    } catch (e) {}
    return await (await this.getEthContract()).methods.ownerOf(tokenId).call();
  }

  private async hasBurned(address: string, tokenId: string): Promise<boolean> {
    const logs = await this.getBurnTransaction(address, tokenId);
    return logs.length > 0;
  }

  private async getBurnTransaction(
    address: string,
    tokenId: string,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await (
        await this.getEthContract()
      ).getPastEvents(
        'Transfer',
        {
          filter: {
            tokenId,
            from: address,
            to: '0x000000000000000000000000000000000000dEaD',
          },
          fromBlock: 0,
          toBlock: 'latest',
        },
        (error, events) => {
          if (error) {
            reject(error);
          } else {
            resolve(events);
          }
        },
      );
    });
  }

  private getMaticContract() {
    if (process.env.TESTNET == '1') {
      const web3 = new this.Web3('https://rpc-mumbai.maticvigil.com/');
      return new web3.eth.Contract(eth721abi, this.eth721AddressTestNetMatic);
    }
    const web3 = new this.Web3('https://rpc-mainnet.maticvigil.com/');
    return new web3.eth.Contract(eth721abi, this.eth721AddressMatic);
  }

  private getEthContract() {
    if (process.env.TESTNET == '1') {
      const web3 = this.getTestnetWeb3();
      return new web3.eth.Contract(eth721abi, this.eth721AddressTestNet);
    }
    const web3 = this.getWeb3();
    return new web3.eth.Contract(eth721abi, this.eth721Address);
  }

  private getTestnetWeb3(): any {
    return new this.Web3(
      'wss://kovan.infura.io/ws/v3/' + process.env.INFURA_ID,
    );
  }

  private getWeb3(): any {
    return new this.Web3(
      'wss://mainnet.infura.io/ws/v3/' + process.env.INFURA_ID,
    );
  }
}

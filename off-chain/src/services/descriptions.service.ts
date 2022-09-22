import { Injectable } from '@nestjs/common';
import * as ipfsAPI from 'ipfs-api';
import * as fs from 'fs';
import { CacheService } from './cache.service';

@Injectable()
export class DescriptionsService {
  private hash: string = null;

  private ipfsClient;

  constructor(private readonly cache: CacheService) {
    this.ipfsClient = ipfsAPI('/ip4/127.0.0.1/tcp/5001');
  }

  async addDescription(tokenId: string, description: string) {
    const descriptions = await this.getDescriptions();
    descriptions[tokenId] = description;

    const cid = (
      await this.ipfsClient.add(
        Buffer.from(JSON.stringify(descriptions), 'utf-8'),
      )
    )[0].hash;
    console.log(cid);
    this.setHash(cid);
    this.cache.set(tokenId, null);
  }

  async getDescription(tokenId: string): Promise<string> {
    return (await this.getDescriptions())[tokenId];
  }

  private async getDescriptions(): Promise<any> {
    const hash = this.getHash();
    if (!hash) {
      return {};
    }
    const raw = (await this.ipfsClient.get(hash))[0].content.toString();
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  }

  private getHash(): string {
    if (this.hash === null) {
      if (!fs.existsSync('./descriptions_ipfs_hash.txt')) {
        return null;
      }
      this.hash = fs.readFileSync('./descriptions_ipfs_hash.txt', 'utf-8');
    }
    return this.hash;
  }

  private setHash(hash: string) {
    fs.writeFileSync('./descriptions_ipfs_hash.txt', hash);
    this.hash = hash;
  }
}

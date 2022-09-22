import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  private readonly memory = {};

  set(tokenId: string, data: any) {
    this.memory[tokenId] = data;
  }

  get(tokenId: string) {
    return this.memory[tokenId];
  }
}

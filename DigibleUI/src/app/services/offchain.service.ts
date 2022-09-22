import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { type } from 'node:os';
import { environment } from 'src/environments/environment';

@Injectable()
export class OffchainService {
  constructor(private http: HttpClient) {}

  async getURIInfo(
    uri: string
  ): Promise<{ name: string; image: string; description: string }> {
    const response: any = await this.http.get(uri).toPromise();
    return response;
  }

  async isVideo(mediaUrl: string): Promise<boolean> {
    const cached = localStorage.getItem('is_video_' + mediaUrl);

    if (cached === 'true') {
      return cached === 'true';
    }
    return new Promise((resolve) => {
      const FileType = require('file-type/browser');
      (async () => {
        const response = await fetch(mediaUrl, {
          headers: {
            Range: 'bytes=0-100',
          },
        });
        const fileType = await FileType.fromStream(response.body);
        if (fileType && fileType.mime === 'video/mp4') {
          localStorage.setItem('is_video_' + mediaUrl, 'true');
          resolve(true);
        } else {
          localStorage.setItem('is_video_' + mediaUrl, 'false');
          resolve(false);
        }
      })();
    });
  }
  async getTotalSales(): Promise<any> {
    let response: any;
    response = await this.http
        .get(
          `${this.getUri()}/nft/sales`
        )
        .toPromise();
    console.log(response)
    return response;
  }
  async getNftMetaData(
    contractAddress: string,
    tokenId: string,
    network: string
  ): Promise<any> {
    let response: any;
    response = await this.http
        .get(
          `${this.getUri()}/nft/sale/${contractAddress}/${tokenId}/${network}`
        )
        .toPromise();
    return response;
  }
  async getNftData(
    tokenId: number,
    network: string,
    tokenAddress?: string
  ): Promise<{
    name: string;
    id: number;
    image: string;
    description: string;
    physical: boolean;
  }> {
    let response: any;
    if (tokenAddress) {
      response = await this.http
        .get(
          `${this.getUri()}/card/${tokenId}/${network}/${tokenAddress}`
        )
        .toPromise();
    } else {
      response = await this.http
        .get(`${this.getUri()}/card/${tokenId}/${network}`)
        .toPromise();
    }
    return response;
  }

  async getNftCubeData(tokenId: number): Promise<{
    name: string;
    id: number;
    image: string;
    description: string;
    physical: boolean;
  }> {
    const response: any = await this.http
      .get(`${this.getUri()}/card/cube/${tokenId}/`)
      .toPromise();
    response.id = tokenId;
    return response;
  }

  async claimCard(
    signature: string,
    email: string,
    address: string,
    tokenId: string
  ): Promise<boolean> {
    return (
      (await this.http
        .post(
          this.getUri() + '/claim',
          {
            signature,
            email,
            address,
            tokenId,
          },
          { responseType: 'json' }
        )
        .toPromise()) as any
    ).status;
  }

  async addDescription(
    signature: string,
    description: string,
    tokenId: string,
    network: string
  ): Promise<boolean> {
    return (await this.http
      .post(
        this.getUri() + '/card/description/' + network + '/' + tokenId,
        {
          signature,
          description,
        },
        { responseType: 'json' }
      )
      .toPromise()) as any;
  }

  async updProfile(
    address: string,
    profileImage: string,
    heroImage: string,
    username: string,
    description: string,
    twitter: string,
    instagram: string,
    email: string,
    tiktok: string,
    twitch: string
  ): Promise<{ uri: string; hash: string }> {
    const da = `{"id": "${address}", "picture": "${profileImage}", "hero_picture": "${heroImage}", "username": "${username}", "description": "${description}", "twitter": "${twitter}", "instagram": "${instagram}", "email": "${email}", "tiktok": "${tiktok}", "twitch": "${twitch}" }`;
    const result = (await this.http
      .post(
        `${environment.offchainApi}/profile/upd/${address}`,
        {
          da,
        },
        { responseType: 'json' }
      )
      .toPromise()) as any;
    return result;
  }

  async uploadFile(
    signature: string,
    file: any,
    relativePath: string
  ): Promise<{ uri: string; hash: string }> {
    var formData = new FormData();
    formData.append('file', file, relativePath);
    formData.append('signature', signature);
    const response = await this.http
      .post(this.getUri() + '/media', formData, { responseType: 'json' })
      .toPromise();
    return response as any;
  }

  async getProfileData(address: string): Promise<any> {
    const response: any = await this.http
      .get(`${this.getUri()}/profile/${address}`)
      .toPromise();
    response.id = address;
    return response;
    // console.log(await fetch(request).then((response) => response.json()));
    // return await fetch(request).then((response) => response.json());
  }

  async getVerifiedAddress(address: string): Promise<any> {
    return await this.http
      .get(`${this.getUri()}/getVerifiedAddress/${address}`)
      .toPromise();
    // console.log(await fetch(request).then((response) => response.json()));
    // return await fetch(request).then((response) => response.json());
  }
  
  async getAllVerifiedWalletAddresses(): Promise<any> {
    return await this.http
      .get(`${this.getUri()}/getAllVerifiedWalletAddresses/`)
      .toPromise();
    // console.log(await fetch(request).then((response) => response.json()));
    // return await fetch(request).then((response) => response.json());
  }

  private getUri(): string {
    return environment.offchainApi;
  }

  async getUsedCode(address: string): Promise<any> {
    const res = await this.http
      .get(`${this.getUri()}/usedcode/${address}`)
      .toPromise();
    return res;
  }

  async setUsedCode(
    address: string,
    usedCode: string
  ): Promise<boolean> {
    const res: any = await this.http
      .post(`${this.getUri()}/usedcode`,
        {
          address,
          usedCode
        },
        { responseType: 'json' }
      )
      .toPromise();
    return res.status === 'success';
  }

  async createSaleData(
    saleId: string,
    network: string
  ): Promise<boolean> {
    const res: any = await this.http
      .post(`${this.getUri()}/sale/create`,
        {
          saleId,
          network
        },
        { responseType: 'json' }
      )
      .toPromise();
    console.log(res);
    return res.status === 'success';
  }

  async removeSaleData(
    saleId: string,
    network: string
  ): Promise<boolean> {
    const res: any = await this.http
      .post(`${this.getUri()}/sale/remove`,
        {
          saleId,
          network
        },
        { responseType: 'json' }
      )
      .toPromise();
    console.log(res);
    return res.status === 'success';
  }

  async updateSaleData(
    saleId: string,
    network: string,
    data: any
  ): Promise<boolean> {
    const res: any = await this.http
      .post(`${this.getUri()}/sale/update`,
        {
          saleId,
          network,
          data
        },
        { responseType: 'json' }
      )
      .toPromise();
    console.log(res);
    return res.status === 'success';
  }

  async getSaleData(
    type: string,
    network: string
  ): Promise<any> {
    const res: any = await this.http
      .post(`${this.getUri()}/sale`,
        {
          type,
          network
        },
        { responseType: 'json' }
      )
      .toPromise();
    if (res.status != 'success') return [];
    return JSON.parse(res?.data);
  }

  async getSaleDataByTokenId(
    tokenId: number,
    network: string
  ): Promise<any> {
    const res: any = await this.http
      .post(`${this.getUri()}/sale/${tokenId}`,
        {
          network
        },
        { responseType: 'json' }
      )
      .toPromise();
    if (res.status !== 'success') return false;
    return JSON.parse(res?.data);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class FormService {
  constructor(private http: HttpClient) {}

  async postForm(formData: object): Promise<{ uri: string; hash: string }> {
    console.log(formData);

    return (await this.http
      .post(
        `${environment.offchainApi}/register`,
        {
          formData,
        },
        { responseType: 'json' }
      )
      .toPromise()) as any;
  }

  private getUri(): string {
    return environment.offchainApi;
  }
}

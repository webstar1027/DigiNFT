import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class SubscribeService {
  mailChimpEndpoint = 'https://digible.us6.list-manage.com/subscribe/post-json?u=7bf882e0587e43a3271eb395f&amp;id=c58f297380&amp';
  constructor(
    private http: HttpClient
  ) { }
  subscribeToList(data) {
    const params = new HttpParams()
      .set('EMAIL', data.email)
      .set('b_7bf882e0587e43a3271eb395f_c58f297380', '');
    const mailChimpUrl = `${this.mailChimpEndpoint}&${params.toString()}`;
    return this.http.jsonp(mailChimpUrl, 'c')
  }
}

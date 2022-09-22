import { Injectable } from '@angular/core';

@Injectable()
export class BrowserService {
  constructor() {}

  static isMetamaskUnvisible(): boolean {
    let isMetamaskUnVisible = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (/apple/i.test(navigator.vendor)) {
      // It's Safari
      isMetamaskUnVisible = true;
    } 
    return isMetamaskUnVisible;     
  }

  static isMobile(): boolean {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }
}

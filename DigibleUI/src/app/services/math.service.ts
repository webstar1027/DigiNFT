import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { math } from '../types/math';

@Injectable()
export class MathService {
  toHumanValue(amount: string, decimals?: number): number {
    if (!decimals) {
      decimals = environment.stableCoinDecimals;
    }

    return parseFloat(
      this.toFixedNoRounding(
        3,
        math
          .chain(math.bignumber(amount))
          .divide(math.bignumber(10).pow(math.bignumber(decimals)))
          .done()
          .toFixed(4)
      )
    );
  }

  withSuffixNumber(convertNum, decimalPlaces = 0) {
    convertNum /= (10 ** decimalPlaces);
    console.log(convertNum);
    if (convertNum < 100000) return convertNum.toLocaleString();
    const exp = Math.log(convertNum) / Math.log(1000);
    console.log(Math.floor(exp));
    const resNum = convertNum / (1000 ** Math.floor(exp));
    console.log( resNum.toLocaleString(undefined, { maximumFractionDigits: 2 }) + 'KMGTPE'.charAt(exp - 1));
    return resNum.toLocaleString(undefined, { maximumFractionDigits: 2 }) + 'KMGTPE'.charAt(exp - 1);
  }

  toBlockchainValue(amount: string, decimals?: number): string {
    if (!decimals) {
      decimals = environment.stableCoinDecimals;
    }
    console.log('AMOUNT', amount);
    let number;
    try {
      number = math.format(
        math
          .chain(math.bignumber(amount))
          .multiply(math.bignumber(10).pow(math.bignumber(decimals)))
          .done(),
        { notation: 'fixed' }
      );
    } catch (e) {
      console.log('ERROR::', e);
    }
    return number;
  }

  public toFixedNoRounding(n: any, d: any) {
    const reg = new RegExp(`^-?\\d+(?:\\.\\d{0,${n}})?`, 'g');
    const a = d.toString().match(reg)[0];
    const dot = a.indexOf('.');

    if (dot === -1) {
      return a + '.' + '0'.repeat(n);
    }

    const b = n - (a.length - dot) + 1;

    return b > 0 ? a + '0'.repeat(b) : a;
  }

  public encodeAddress(address:string, usedUpCodes: string[]) {
    
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    var length = 4;
    
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    // if result exist in usedUpCodes, generate new one with one more lengh
    while(usedUpCodes.includes(result)) {
      length +=1;
      var newResult = '';
      for ( var i = 0; i < length; i++ ) {
        newResult += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      result = newResult;
    }
    return result;
  }
}



import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { WalletService } from 'src/app/services/wallet.service';
import { MoralisService } from 'src/app/services/moralis.service';
import { DigiTrackService } from 'src/app/services/digitrack.service';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-digi-track',
  templateUrl: './digi-track.component.html',
  styleUrls: ['./digi-track.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => active', [
        style({ opacity: 0 }),
        animate(10000, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class AboutDigiTrackComponent {
  @Input() config: any = {};
  digiTrackAddress = environment.digiTrackAddressMatic;
  enterDigiTrackForm: FormGroup;
  isDigisafe;
  

  constructor(
    
    private readonly moralis: MoralisService,
    private readonly digitrack: DigiTrackService
  ) {}

  async checkDigisafeStatus(): Promise<void> {
    console.log("checking if digisafe");
    // let address = (document.getElementById("isDigisafe") as HTMLInputElement).value;
    //   await this.digitrack.isWalletDigiSafe(address).then((res) => {
    //     this.isDigisafe = res;
    //     console.log(address + " is digisafe:" + this.isDigisafe);
    //   });
    }

  }
  



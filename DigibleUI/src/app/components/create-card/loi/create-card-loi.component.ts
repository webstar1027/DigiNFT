import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Moralis } from 'moralis';
import { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { VerifiedWalletsService } from 'src/app/services/verified-wallets.service';
import { environment } from 'src/environments/environment';
import { MoralisService } from '../../../services/moralis.service';
import { FormService } from '../../../services/form.service';
import { NftService } from '../../../services/nft.service';
import { OffchainService } from '../../../services/offchain.service';
import { WalletService } from '../../../services/wallet.service';
import { Receipt } from '../../../types/mint.types';
import { DigiService } from 'src/app/services/digi.service';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-create-card-loi',
  templateUrl: './create-card-loi.component.html',
  styleUrls: ['./create-card-loi.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateCardComponentLOI implements OnInit {
  @Output() errorData = new EventEmitter<{ errorMessage: string, showAlertMessage: boolean }>();
  formData: any = {};
  showAlertMessage: boolean = false;
  imageUrlPREVIEW;
  frontImageAdded;
  error_message;
  tokenUri;
  isVideo: boolean = false;
  fileName;
  fileBase64String;
  ipfsImageUrl;
  ipfsHash;
  ipfsDescriptionHash;
  ipfsUri;
  network;
  q;
  traitsArray;
  ipfsHashBack;
  ipfsUriBack;
  isVideoBack;
  BlockchainsDropDown = [
    
    {
      name: 'Binance Smart Chain',
      id: 'BSC',
      contractAddress: environment.nftDigiLOIBSC,
    },
    /* { name: 'Ethereum', id: 'ETH', contractAddress: environment.nftAddress }, */
  ];
  addAttributesForm: FormGroup;
  Blockchains;
  walletReceiver;
  walletReceiverBack;
  cardName;
  physical;
  nftDescription;
  cardPublisher;
  cardEdition;
  cardYear;
  cardGraded;
  cardPopulation;
  tokenId;
  isVerifiedAddress;
  json = {
    name: this.formData.cardName,
    description: this.formData.description,
    image: this.formData.ipfsHash,
    attributes: [
      {
        trait_type: 'selected type',
        value: 'val',
      },
    ],
  };

  loading = false;

  constructor(
    private readonly wallet: WalletService,
    private fb: FormBuilder,
    private readonly offchain: OffchainService,
    private readonly verifieds: VerifiedWalletsService,
    private readonly nft: NftService,
    private readonly router: Router,
    private readonly moralis: MoralisService,
    private readonly digiService: DigiService,
  ) {}

  ngOnInit(): void {
    this.setWalletAddress();
    this.wallet.getNetwork().then((res) => {
      this.network = res;
    });

    this.addAttributesForm = this.fb.group({
      attributes: this.fb.array([this.createTraitInput()], Validators.required),
    });
  }

  getMintNetwork() {
    const mNet = this.BlockchainsDropDown.find((item) => item.id === this.network);
    if (mNet !== undefined) {
      return mNet.name;
    }
    return '';
  }

  async setWalletAddress() {
    this.walletReceiver = await this.wallet.getAccount();
  }

  async create(): Promise<void> {
    let tokenUriData: any;
    this.loading = true;
    if (this.addAttributesForm.status !== 'VALID') {
      this.loading = false;
      return;
    } else {
      this.traitsArray = this.addAttributesForm.value.attributes;
    }

    try {
      let imageFile;
      let image = this.fileBase64String;
      let imageName = this.fileName;
      if (this.walletReceiver === null) throw new Error('You have to connect wallet first.');

      imageFile = new Moralis.File(imageName, {base64: image});
      await imageFile.saveIPFS({useMasterKey:true});
      this.ipfsImageUrl = imageFile.ipfs();
      tokenUriData = {
        name: this.formData.cardName,
        description: this.formData.nftDescription,
        image: this.ipfsImageUrl,
        attributes: this.traitsArray,
      };
      if (this.formData.physical === undefined) {
        this.physical = false;
      } else if (this.formData.physical) {
        this.physical = true;
        const physicalTrait = {
          trait_type: 'Physically Backed',
          value: 'Yes',
        };
        this.traitsArray.push(physicalTrait);
      }
      if (this.isVideo) this.traitsArray.push({
        trait_type: 'Video',
        value: 'Yes',
      })
    } catch (e) {
      this.loading = false;
      this.showAlertMessage = true;
      this.error_message = e?.message
      this.errorData.emit({ errorMessage: this.error_message, showAlertMessage: true });
      return console.log(e);
    }

    try {
      let jsonfile;
      jsonfile = new Moralis.File('file.json', {
        base64: btoa(JSON.stringify(tokenUriData)),
      });
      await jsonfile.saveIPFS();
      this.tokenUri = jsonfile.ipfs();
    } catch (e) {
      return console.log(e);
    }

    try {
      const result: Receipt = await this.nft.mintByNftContract(
        this.walletReceiver,
        this.formData.cardName,
        this.ipfsImageUrl,
        this.formData.physical,
        this.tokenUri,
        this.network,
        this.digiService.getLOINFTContractAddressByNetwork(this.network)
      );
      if (
        result.events &&
        result.events.Transfer &&
        result.events.Transfer.returnValues &&
        result.events.Transfer.returnValues['2']
      ) {
        this.tokenId = result.events.Transfer.returnValues['2'];
      }
      localStorage.removeItem("autocomplete");
      await this.router.navigate(['/profile/' + this.walletReceiver]);
    } catch (e) {
      return console.log(e);
    }
    this.loading = false;
  }

  setTraits() {
    // GET TRAITS DATA AND SUBMIT HERE
    if (this.addAttributesForm.status == 'VALID') {
      this.traitsArray = this.addAttributesForm.value.attributes;
      document.getElementById('addPropertiesModal').click();
    }
  }

  get attributes(): FormArray {
    return <FormArray>this.addAttributesForm.get('attributes');
  }

  removeTrait() {
    this.attributes.removeAt(this.attributes.length - 1);
  }

  addTrait() {
    this.attributes.push(this.createTraitInput());
  }

  createTraitInput(): FormGroup {
    return this.fb.group({
      trait_type: [null, Validators.required],
      value: [null, Validators.required],
    });
  }

  async droppedFrontSide(files: any): Promise<void> {
    if (files.length === 0) {
      return;
    }
    const droppedFile = files[0];
    const fileType = this.getFileType(droppedFile.fileEntry.name);
    if (
      droppedFile &&
      droppedFile.fileEntry.isFile &&
      fileType > 0
    ) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file(async (file: any) => {
        const toBase64 = (someFile) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(someFile);
            reader.onerror = (error) => reject(error);
            reader.onload = () => {
              this.imageUrlPREVIEW = reader.result;
              resolve(reader.result);
            };
          });
        const baseString: any = await toBase64(file);
        this.fileBase64String = baseString;
        this.fileName = fileEntry.name;
        this.isVideo = fileType === 2;
        // this.frontImageAdded = true;
      });
    }
  }

  getFileType(fileName: string) {
    const allowedImageFiles = ['.png', '.jpg', '.jpeg', '.gif', '.jpeg'];
    const allowedVideoFiles = ['.mp4'];
    const regex = /(?:\.([^.]+))?$/;
    const extension = regex.exec(fileName);
    if (undefined !== extension && null !== extension) {
      for (const ext of allowedImageFiles) {
        if (ext === extension[0]) return 1; // Image
      }
      for (const ext of allowedVideoFiles) {
        if (ext === extension[0]) return 2; // Video
      }
    }
    return 0;
  }

  closeErrorBanner() {
    // CLose banner here
    this.showAlertMessage = false;
  }


  /*  async droppedFrontSide(files: any): Promise<void> {
    console.log('DROPPED!');
    
    if (files.length === 0) {
      return;
    }
    const droppedFile = files[0];

    if (droppedFile && droppedFile.fileEntry.isFile) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

      fileEntry.file((file: File) => {
        this.fileName = fileEntry.name
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          console.log(reader.result);
          this.fileBase64String = reader.result
        };
        reader.onerror = (error) => {
          console.log(error);
        };
        reader.onload = () => {
          this.imageUrlPREVIEW = reader.result;
        };
        console.log(this.fileName, this.fileBase64String);
      });
    }
  } */

/*   async droppedBackSide(files: NgxFileDropEntry[]): Promise<void> {
    // console.log(files);

    if (files.length === 0) {
      return;
    }
    const droppedFileBack = files[0];

    if (droppedFileBack && droppedFileBack.fileEntry.isFile) {
      const fileEntry2 = droppedFileBack.fileEntry as FileSystemFileEntry;

      fileEntry2.file(async (file: File) => {
        this.loading = true;
        try {
          // console.log(droppedFileBack);
          const signature = await this.sign();
          const ipfs2 = await this.offchain.uploadFile(
            '0x49c92d11f1cbb03e808d51982140a7b77eae92aac8ab453b44333715a5b471760b175f7112ff6be10a17bcc731024e456762affc3bd510256c758f7720007a7f1c',
            file,
            droppedFileBack.relativePath
          );

          this.ipfsHashBack = ipfs2.hash;
          this.ipfsUriBack = ipfs2.uri;

          if (!this.walletReceiver) {
            this.walletReceiver = await this.wallet.getAccount();
          }
          if (file.type === 'video/mp4') {
            // console.log("video/mp4");
            this.isVideoBack = true;
            // console.log(this.isVideoBack);
          }
          this.loading = false;
        } catch (e) {}
      });
    }
  } */

  async sign(message = ''): Promise<string> {
    return await this.wallet.signMessage(message || 'Digible');
  }

  async removeFrontSideImage(): Promise<void> {
    this.ipfsHash = '';
    this.ipfsUri = '';
    this.isVideo = false;
  }

  async removeBackSideImage(): Promise<void> {
    this.ipfsHashBack = '';
    this.ipfsUriBack = '';
    this.isVideoBack = false;
  }
}

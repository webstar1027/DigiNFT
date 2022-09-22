import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Moralis } from 'moralis';
import { FileSystemFileEntry } from 'ngx-file-drop';
import { environment } from 'src/environments/environment';
import { NftService } from '../../../services/nft.service';
import { WalletService } from '../../../services/wallet.service';
import { Receipt, WalletReceipt } from '../../../types/mint.types';

@Component({
  selector: 'app-create-multicard-loi',
  templateUrl: './create-multicard-loi.component.html',
  styleUrls: ['./create-multicard-loi.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class CreateMultiCardComponentLoi implements OnInit {
  @Output() errorData = new EventEmitter<{ errorMessage: string, showAlertMessage: boolean }>();
  formData: NftData = {
    attributes: []
  };
  nftData: NftData[] = [];
  currentEditNftIndex: number = 0;
  editAttributes: NftDataAttribute[] = [];
  showAlertMessage: boolean = false;
  error_message;
  tokenUri;
  fileName;
  fileBase64String;
  ipfsImageUrl;
  network;
  traitsArray;
  uploadProgress = 0;
  BlockchainsDropDown = [
    // {
    //   name: 'Polygon',
    //   id: 'MATIC',
    //   contractAddress: environment.nftAddressMatic,
    // },

    {
      name: 'Binance Smart Chain',
      id: 'BSC',
      contractAddress: environment.nftDigiLOIBSC,
    },
    /* { name: 'Ethereum', id: 'ETH', contractAddress: environment.nftAddress }, */
  ];
  walletReceiver; // Connected wallet address
  tokenId;
  loading = false;

  constructor(
    private readonly wallet: WalletService,
    private fb: FormBuilder,
    private readonly nft: NftService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.setWalletAddress();
    this.wallet.getNetwork().then((res) => {
      this.network = res;
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
    console.log(this.walletReceiver, 'wallet receiver');
  }

  async bulkMintParams() {
    for (let item of this.nftData) {
      if (item.attributes.length === 0 || item.attributes[0].trait_type === '') {
        throw new Error("You have to add at least one property");
      }

      if (item.qty < 1 || item.qty === null) throw new Error('Quantity must be bigger than 0.');

      const imageFile: any = new Moralis.File(item.fileName, {base64: item.image});
      await imageFile.saveIPFS({useMasterKey:true});
      item.image = await imageFile.ipfs();
      const tokenUriData = {
        name: item.name,
        description: item.description,
        image: item.image,
        attributes: item.attributes,
      };
      if (item.physical === undefined) {
        item.physical = false;
      } else if (item.physical) {
        item.physical = true;
        const physicalTrait: NftDataAttribute = {
          trait_type: 'Physically Backed',
          value: 'Yes',
        };
        item.attributes.push(physicalTrait);
      }

      if (item.isVideo) item.attributes.push({
        trait_type: 'Video',
        value: 'Yes',
      })

      let jsonfile;
      jsonfile = new Moralis.File('file.json', {
        base64: btoa(JSON.stringify(tokenUriData)),
      });
      await jsonfile.saveIPFS();
      item.tokenUri = await jsonfile.ipfs();
      this.uploadProgress = this.uploadProgress + 1;
    };
  }

  async bulkMint(): Promise<void> {
    this.loading = true;
    try {
      if (this.walletReceiver === null) throw new Error('You have to connect wallet first.');
      let mintAmount = 0;
      this.nftData.map((item) => mintAmount += item.qty);
      if (mintAmount > 20) {
        throw new Error("You exceeded the max amount of mint : 20");
      }
      await this.bulkMintParams();
      const result = await this.nft.bulkMint(
        this.walletReceiver,
        this.nftData,
        this.network
      );
      if (result?.code === 4001) {
        throw new Error(result?.message);
      }
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
      this.loading = false;
      this.showAlertMessage = true;
      this.error_message = e?.message
      this.errorData.emit({ errorMessage: this.error_message, showAlertMessage: true });
      console.log(e);
    }
  }

  setTraits() {
    if (this.traitFormStatus())
    {
      this.formData.attributes = [];
      this.editAttributes.map((item) => this.formData.attributes.push({...item}));
      document.getElementById('addPropertiesModalTrigger').click();
    }
  }

  removeTrait(rIndex) {
    this.editAttributes.splice(rIndex, 1);
  }

  addProp() {
    this.editAttributes = [];
    this.formData.attributes.map((item) => this.editAttributes.push({...item}));
    document.getElementById('addPropertiesModalTrigger').click();
  }

  addTrait() {
    this.editAttributes.push({
      trait_type: '',
      value: '',
    });
  }

  async droppedFrontSide(files: any): Promise<void> {
    if (files.length === 0) {
      return;
    }
    files.map((fItem) => {
      const droppedFile = fItem;
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
                const fIndex = this.nftData.findIndex((item) => item.image === '');
                if (fIndex > -1) {
                  this.nftData[fIndex] = {
                    ...this.nftData[fIndex],
                    image: reader.result,
                    fileName: fileEntry.name,
                    isVideo: fileType === 2
                  }
                } else {
                  this.nftData.push({
                    name: 'Untitled NFT',
                    image: reader.result,
                    attributes: [{
                      trait_type: '',
                      value: ''
                    }],
                    fileName: fileEntry.name,
                    qty: 1,
                    isVideo: fileType === 2
                  });
                }
                resolve(reader.result);
              };
            });
            await toBase64(file);
        });
      }
    })
  }

  async droppedCsv(files: any): Promise<void> {
    if (files.length === 0) {
      return;
    }
    files.map((fItem) => {
      const droppedFile = fItem;
      if (
        droppedFile &&
        droppedFile.fileEntry.isFile &&
        this.isValidCSVFile(droppedFile.fileEntry.name)
      ) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file(async (file: any) => {
          const readCsv = (someFile) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsText(someFile);
              reader.onerror = (error) => reject(error);
              reader.onload = () => {
                const csvRecordsArray = (<string>reader.result).split(/\r\n|\n/);
                csvRecordsArray.slice(1, csvRecordsArray.length).map((item) => {
                  const rowData = item.split(',');
                  if (rowData.length > 1) {
                    const rowAttr: NftDataAttribute[] = [];
                    for (let i = 3; i < rowData.length; i += 2) {
                      const element = rowData[i];
                      if (element !== '') {
                        rowAttr.push({
                          trait_type: element,
                          value: rowData[i + 1],
                        });
                      }
                    }
                    this.nftData.push({
                      name: rowData[0],
                      image: '',
                      description: rowData[1],
                      physical: rowData[2] === 'Yes',
                      attributes: rowAttr,
                      qty: 1,
                    });
                  }
                });
                resolve(reader.result);
              };
            });
            await readCsv(file);
        });
      } else {
        this.showAlertMessage = true;
        this.error_message = "Please upload valid file";
        this.errorData.emit({ errorMessage: "Please upload valid file", showAlertMessage: true });
      }
    })
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

  isValidCSVFile(fileName: string) {
    return fileName.endsWith(".csv");  
  }

  closeErrorBanner() {
    // CLose banner here
    this.showAlertMessage = false;
  }

  editNft(nIndex) {
    this.formData = {
      ...this.nftData[nIndex],
      attributes: [...this.nftData[nIndex].attributes]
    };

    this.currentEditNftIndex = nIndex;
    document.getElementById('editNftModalTrigger').click();
  }

  removeNft(rIndex) {
    this.nftData.splice(rIndex, 1);
  }

  saveFormData() {
    this.nftData[this.currentEditNftIndex] = {
      ...this.formData,
    };
    document.getElementById('closeEditNftModal').click();
  }

  applyAll() {
    for (let index = 0; index < this.nftData.length; index++) {
      this.nftData[index] = {
        ...this.nftData[index],
        description: this.formData.description,
        physical: this.formData.physical,
        attributes: this.formData.attributes,
      };
    }
    this.saveFormData();
  }

  traitFormStatus() {
    for(const item of this.editAttributes) {
      if (item.trait_type === '' || item.value === '') return false;
    }
    return true;
  }
}

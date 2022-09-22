import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent {
  showContent;

  constructor(
    // private readonly nft: NftService,
  ) {}

  ngOnInit(): void {
    // this.loadData();
  }

  toggleFaq (event) {
    // console.log(event.target);
  }
}

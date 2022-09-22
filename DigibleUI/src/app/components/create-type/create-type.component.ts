import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-type',
  templateUrl: './create-type.component.html',
  styleUrls: ['./create-type.component.scss'],
})

export class CreateTypeComponent {
  constructor(
    readonly router: Router,
  ) {
  }
}

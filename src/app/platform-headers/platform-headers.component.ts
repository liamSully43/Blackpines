import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-platform-headers',
  templateUrl: './platform-headers.component.html',
  styleUrls: ['./platform-headers.component.scss']
})
export class PlatformHeadersComponent implements OnInit {

  @Input() platform: string;

  constructor() { }

  ngOnInit(): void {}

}

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() feed;
  @Input() posts;
  @Input() new;
  @Input() account;
  @Input() search;

  constructor() { }

  ngOnInit(): void { }

}

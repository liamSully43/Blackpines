import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-twitter-account',
  templateUrl: './twitter-account.component.html',
  styleUrls: ['./twitter-account.component.scss']
})
export class TwitterAccountComponent implements OnInit {

  @Input() account;

  constructor() { }

  ngOnInit(): void {
  }

}

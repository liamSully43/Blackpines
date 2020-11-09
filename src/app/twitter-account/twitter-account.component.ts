import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-twitter-account',
  templateUrl: './twitter-account.component.html',
  styleUrls: ['./twitter-account.component.scss']
})
export class TwitterAccountComponent implements OnInit {

  @Input() account;

  @Output() closePreview = new EventEmitter();
  
  constructor() { }

  ngOnInit(): void {
    document.querySelector("body").addEventListener("keyup", event => (event.key == "Escape") ? this.close() : null); // will close the preview if esc is pressed
  }

  ngOnChanges() {
    console.log(this.account);
    this.account.followersRounded = this.roundNumbers(this.account.followers_count);
    this.account.followingRounded = this.roundNumbers(this.account.friends_count);
  }

  // rounds the number of following & followers to the neares 1000 or million
  roundNumbers(num) {
    if(num >= 1000 && num <= 999999) {
      num = Math.floor(num/1000)
      num += "K";
    }
    if(num >= 1000000) {
      num = Math.floor(num/1000000);
      num += "M";
    }
    return num;
  }

  close() {
    this.closePreview.next();
  }

}

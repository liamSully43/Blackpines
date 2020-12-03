import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss']
})
export class AccountProfileComponent implements OnInit {
  @Input() account: any = {};
  @Input() error: boolean;

  @Output() disconnectMethod = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {}

  ngOnChanges() {
    this.account.statusesRounded = this.roundNumbers(this.account.statuses_count);
    this.account.followingRounded = this.roundNumbers(this.account.friends_count);
    this.account.followersRounded = this.roundNumbers(this.account.followers_count);
  }

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

  disconnect() :void {
    const id = this.account.id_str;
    this.disconnectMethod.next(id);
  }

}

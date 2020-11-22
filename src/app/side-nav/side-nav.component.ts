import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {

  myFeed: boolean = true;

  @Input() user: any = false;

  @Output() activityFeed = new EventEmitter<boolean>();
  @Output() viewUser = new EventEmitter<Object>();

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges() {
    const url = this.user.profile_image_url.replace("normal", "200x200");
    this.user.profile_image_url = url;
    this.user.followersRounded = this.roundNumbers(this.user.followers_count);
    this.user.followingRounded = this.roundNumbers(this.user.friends_count);
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

  toggleFeed() {
    this.myFeed = !this.myFeed;
    this.activityFeed.next(this.myFeed);
  }

  viewAccount() {
    this.viewUser.next(this.user);
  }
}

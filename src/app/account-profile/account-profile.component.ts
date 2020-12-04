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

  expanded:boolean = false;

  profile_pic:any = "";
  banner_pic:string = "";

  constructor() { }

  ngOnInit(): void {}

  ngOnChanges() {
    this.account.statusesRounded = this.roundNumbers(this.account.statuses_count);
    this.account.followingRounded = this.roundNumbers(this.account.friends_count);
    this.account.followersRounded = this.roundNumbers(this.account.followers_count);
    const profilePic = this.account.profile_image_url_https.replace("normal", "200x200");
    this.account.profile_image_url_https = profilePic;
    this.profile_pic = `url(${profilePic})`;
    if(this.account.profile_banner_url) {
      this.banner_pic = this.account.profile_banner_url;
    }
    console.log(this.account);
    setTimeout(() => console.log(this.profile_pic), 5000);
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

  updateAccount(e) {
    e.preventDefault;
    console.log("form submitted");
  }

  updatePhoto(e) {
    console.log(e);
    // const img = JSON.stringify(e.srcElement.files[0].name);
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]); // read file as data url
    reader.onload = (event) => { // called once readAsDataURL is completed
      console.log(event);
      this.profile_pic = reader.result; // not updating profile_pic
    }
  }

  updateBanner(e) {
    this.banner_pic = e.srcElement.files[0].name;
  }

  expand() {
    this.expanded = !this.expanded;
  }
}

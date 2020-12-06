import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss']
})
export class AccountProfileComponent implements OnInit {
  @Input() account: any = {};
  @Input() error: boolean;

  @Output() disconnectMethod = new EventEmitter<string>();

  bannerProvided: boolean = false;

  disableButton:boolean = true;

  headers = new HttpHeaders().set("Authorization", "auth-token");

  constructor(private http: HttpClient) { }

  ngOnInit(): void {}

  ngOnChanges() {
    this.account.statusesRounded = this.roundNumbers(this.account.statuses_count);
    this.account.followingRounded = this.roundNumbers(this.account.friends_count);
    this.account.followersRounded = this.roundNumbers(this.account.followers_count);
    const profilePic = this.account.profile_image_url_https.replace("normal", "200x200");
    this.account.profile_image_url_https = profilePic;
    if(this.account.profile_banner_url) {
      const bannerPic = this.account.profile_banner_url.replace("normal", "200x200");
      this.account.profile_banner_url = bannerPic;
      this.bannerProvided = true;
    }
    console.log(this.account);
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

  updateAccount(e) {
    e.preventDefault;
    console.log("form submitted");
  }

  updatePhoto(e) {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      this.account.profile_image_url_https = reader.result;
    }
    this.disableButton = false;
  }
  
  updateBanner(e) {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      this.account.profile_banner_url = reader.result;
      this.bannerProvided = true;
    }
    this.disableButton = false;
  }
  
  updateFields(field, e) {
    switch(field) {
        case "name":
          this.account.name = e.target.value;
          this.disableButton = false; // this needs to be added to each case, in case the default path is used and nothing is actually updated
          break;
        case "location":
          this.account.location = e.target.value;
          this.disableButton = false;
          break;
        case "url":
          if(this.account.entities.url) {
            this.account.entities.url.urls[0].display_url = e.target.value;
          }
          else {
            // this matches the patter Twitter provides of 'url.urls[0].display_url'
            const newUrl = {
              urls: [{
                display_url: e.target.value,
                expanded_url: e.target.value,
              }]
            };
            this.account.entities.url = newUrl;
          }
          this.disableButton = false;
          break;
        case "colour":
          this.account.profile_link_color = e.target.value.replace("#", ""); // removes the hash - Twitter passes back no hash by default
          this.disableButton = false;
          break;
        case "bio":
          this.account.description = e.target.value;
          this.disableButton = false;
          break;
        default:
          break;
    }
  }

  updateAccountInfo() {
    const headers = this.headers;
    const url = (this.account.entities.url) ? this.account.entities.url.urls[0].display_url : null;
    const userUpdate = {
      name: this.account.name,
      location: this.account.location,
      url,
      profile_link_color: this.account.profile_link_color,
      description: this.account.description,
      // profilePic: this.account.profile_image_url_https,
      // banner: this.account.profile_banner_url 
    }
    const id = this.account.id_str;
    console.log(userUpdate)
    this.http.post("api/twitter/account/update", { headers, userUpdate, id }).subscribe((res: any) => {
      if(res.success) {
        this.showSuccess();
        console.log("updated");
      }
      else {
        this.showError();
        console.log(res.message);
      }
    })
  }

  disconnect() :void {
    const id = this.account.id_str;
    this.disconnectMethod.next(id);
  }

  showSuccess() {

  }

  showError() {

  }
}

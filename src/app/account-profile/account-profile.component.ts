import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss']
})
export class AccountProfileComponent implements OnInit {
  @Input() account: any = {};

  @Output() disconnectMethod = new EventEmitter<string>();

  messages: Array<any> = [];

  name:string = "";
  location:string = "";
  url:string = "";
  description:string = "";
  photoChanged:boolean = false;
  bannerChanged:boolean = false;
  newPhoto: any;
  newBanner: any;

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
    for(const url of this.account.entities.description.urls) {
      this.account.description = this.account.description.replace(url.url, url.display_url); // swaps the Twitter provided shortened url with the actual url
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

  updatePhoto(e) {
    console.log(e);
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      console.log(typeof reader.result);
      this.account.profile_image_url_https = reader.result;
      this.newPhoto = e.target.files[0];
      this.photoChanged = true;
    }
    this.disableButton = false;
  }
  
  updateBanner(e) {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      this.account.profile_banner_url = reader.result;
      this.bannerProvided = true;
      this.newBanner = e.target.files[0].name;
      this.bannerChanged = true;
    }
    this.disableButton = false;
  }
  
  updateFields(field, e) {
    setTimeout(() => {
      if(e.key === "[" || e.key === "]") {
        this.messages.push("Square bracket characters are not supported and will be removed when updating your account information.");
        setTimeout(() => this.messages = [], 5000);
        
      }
      if(e.key === "<" || e.key === ">") {
        this.messages.push("Less-than & greater-than characters are not supported and will be removed when updating your account information.");
        setTimeout(() => this.messages = [], 5000);
      }
      switch(field) {
        case "name":
          this.account.name = e.target.value.replace(/\[|\]|<|>/gi, " "); // replaces [ ] < >
          this.name = e.target.value.replace(/\[|\]|<|>/gi, " ");
          this.disableButton = false; // this needs to be added to each case, in case the default path is used and nothing is actually updated
          break;
        case "location":
          this.account.location = e.target.value.replace(/\[|\]|<|>/gi, " "); // replaces [ ] < >
          this.location = e.target.value.replace(/\[|\]|<|>/gi, " ");
          this.disableButton = false;
          break;
        case "url":
          if(this.account.entities.url) {
            this.account.entities.url.urls[0].display_url = e.target.value.replace(/\[|\]|<|>/gi, " "); // replaces [ ] < >
            this.url = e.target.value.replace(/\[|\]|<|>/gi, " ");
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
        case "bio":
          this.account.description = e.target.value.replace(/\[|\]|<|>/gi, " "); // replaces [ ] < >
          this.description = e.target.value.replace(/\[|\]|<|>/gi, " ");
          this.disableButton = false;
          break;
        default:
          break;
      }
    }, 1);
  }

  updateAccountInfo() {
    const headers = this.headers;
    const url = (this.account.entities.url) ? this.account.entities.url.urls[0].display_url : null;
    const userUpdate = {
      name: this.account.name,
      location: this.account.location,
      url,
      description: this.account.description,
    }
    for(let key in userUpdate) {
      let string = userUpdate[key];
      string.replace("/", " ");
      userUpdate[key] = string;
    }
    const id = this.account.id_str;
    const newImage = (this.photoChanged) ? this.account.profile_image_url_https : true; // if the image or banner is not updated - pass through true for the callback function
    const newBanner = (this.bannerChanged) ? this.newBanner : true;
    this.http.post("api/twitter/account/update", { headers, userUpdate, id, newImage, newBanner }).subscribe((res: any) => {
      this.messages = res;
      console.log(this.messages);
      setTimeout(() => this.messages = [], 7000);
    })
  }

  disconnect() :void {
    const id = this.account.id_str;
    this.disconnectMethod.next(id);
  }
}

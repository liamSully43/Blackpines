import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss']
})
export class AccountProfileComponent implements OnInit {
  @Input() account: any = {};
  @Input() count: number;

  @Output() disconnectMethod = new EventEmitter<any>();

  message: any = {};

  name:string = "";
  location:string = "";
  url:string = "";
  description:string = "";

  disableButton:boolean = true;

  headers = new HttpHeaders().set("Authorization", "auth-token");

  constructor(private http: HttpClient) { }

  ngOnInit(): void {}

  ngOnChanges() {
    this.account.statusesRounded = this.roundNumbers(this.account.statuses_count);
    this.account.followingRounded = this.roundNumbers(this.account.friends_count);
    this.account.followersRounded = this.roundNumbers(this.account.followers_count);
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
  
  updateFields(field, e) {
    setTimeout(() => {
      if(e.key === "[" || e.key === "]") {
        this.message.success = false;
        this.message.text = "Square bracket characters are not supported and will be removed when updating your account information.";
        setTimeout(() => this.message = {}, 5000);
        
      }
      if(e.key === "<" || e.key === ">") {
        this.message.success = false;
        this.message.text = "Less-than & greater-than characters are not supported and will be removed when updating your account information.";
        setTimeout(() => this.message = {}, 5000);
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
    const id = this.account.id_str;
    this.http.post("api/twitter/account/update", { headers, userUpdate, id }).subscribe((res: any) => {
      this.message = res;
      console.log(this.message);
      setTimeout(() => this.message = {}, 7000);
    })
  }

  disconnect(e) :void {
    const id = this.account.id_str;
    const element = e.path[5];
    const val = {
      id,
      element
    }
    this.disconnectMethod.next(val);
  }
}

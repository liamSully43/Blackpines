import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.scss']
})
export class NewPostComponent implements OnInit {

  twitter = {
    connected: false,
    feed: false,
  };
  connectedAccounts: Array<any> = [];
  user: any = false;
  disabled: boolean = true;
  percentage: number = 0;

  success: boolean = false;
  messages: Array<any> = [];
  loading: boolean = false;

  selectedAccounts = [];
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.get("api/user", { headers }).subscribe((data: any) => {
      this.user = data;
      this.connectedAccounts = data.twitter;
      this.twitter = {
        connected: (this.user.twitter.length > 0) ? true : false,
        feed: (this.user.twitter.length > 0) ? true : false
      }
      this.disableButtons();
    });
  }

  // this function checks the length of the post to prevent it from exceeding platform max post lengths
  onPrimaryInput() {
    const primary = (<HTMLInputElement>document.querySelector(".primary-input"));
    //setTimeout is required as the input fields don't get updated with the user's input before the code runs - this delay gives it a second to update the value to check the lengths 
    setTimeout(() => {
      const length = primary.value.length * 100;
      this.percentage = Math.floor(length / 280);
      document.querySelector(".background").setAttribute("style", `width: ${this.percentage}%`);
    }, 1);
  }

  toggleUser(cb) {
    const checkbox = (<HTMLInputElement>cb.srcElement); // the visible green "checkbox"
    // the hidden actual checkbox
    const input = (cb.path) ? cb.path[1].childNodes[0] : cb.srcElement.previousElementSibling; // browser compatability - firefox doesn't use .path
    const id = cb.srcElement.id;
    if(checkbox.classList.contains("active-cb")) {
        checkbox.classList.remove("active-cb");
        for(let [index, account] of this.selectedAccounts.entries()) {
          if(account.id_str == id) {
            this.selectedAccounts.splice(index, 1);
            break;
          }
        }
    }
    else {
        checkbox.classList.add("active-cb");
        for(let account of this.connectedAccounts) {
          if(account.id_str == id) {
            this.selectedAccounts.push(account);
          }
        }
    }
    input.checked = !input.checked
    this.twitter.feed = input.checked;
    this.disableButtons()
  }

  newPost(e) {
    e.preventDefault();
    const post = e.srcElement[0].value;
    const connectedOrActive = this.disableButtons();
    // the user can only post if the post length is more than 0, less than 280 & they are connected to at least one platform
    const qualify = (post.length > 0 && post.length <= 280 && !connectedOrActive) ? true: false;
    if(!qualify) return;
    this.loading = true;
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    const accounts = this.selectedAccounts;
    this.http.post("newpost", { headers, post, accounts }, {responseType: "json"}).subscribe((results: Array<any>) => { // will return an array of object results for each Twitter account 
      this.loading = false;
      this.messages = results;
      let clear = true;
      for(let result of this.messages) {
        if(result.success) {
          this.success = true;
          setTimeout(() => this.success = false, 5000);
        }
        else {
          clear = false;
        }
      }
      if(clear) {
        e.srcElement.reset();
        this.percentage = 0;
      }
    });
  }

  /*
  
  Something wen't wrong when posting to Twitter, please try again later
  `Posted to @${account.screen_name}'s Twitter`

  */

  // if all feeds are hidden or no platforms are connected; set disabled to true to disable all buttons and prevent any posting
  disableButtons() {
    return this.disabled = ((
      !this.twitter.feed
      ) || (
      !this.twitter.connected
      )) ? true : false;
  }
}
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { connected } from 'process';

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
  linkedin = {
    connected: false,
    feed: false,
  };
  facebook = {
    connected: false,
    feed: false,
  };
  user: any = false;
  disabled: boolean = true;
  percentage: number = 0;

  success: boolean = false;
  messages: Array<any> = [];
  loading: boolean = false;
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.get("api/user", { headers }).subscribe(data => {
      this.user = data;
      this.twitter = {
        connected: (typeof this.user.twitterProfile !== "undefined" && this.user.twitterProfile !== null) ? true : false,
        feed: (typeof this.user.twitterProfile !== "undefined" && this.user.twitterProfile !== null) ? true : false
      }
      this.linkedin = {
        connected: (typeof this.user.linkedinProfile !== "undefined" && this.user.linkedinProfile !== null) ? true : false,
        feed: (typeof this.user.linkedinProfile !== "undefined" && this.user.linkedinProfile !== null) ? true : false
      }
      this.facebook = {
        connected: (typeof this.user.facebookProfile !== "undefined" && this.user.facebookProfile !== null) ? true : false,
        feed: (typeof this.user.facebookProfile !== "undefined" && this.user.facebookProfile !== null) ? true : false,
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

  togglePlatforms(cb) {
    const checkbox = (<HTMLInputElement>cb.srcElement); // the visible green "checkbox"
    const input = cb.path[1].childNodes[0]; // the hidden actual checkbox
    if(checkbox.classList.contains("active-cb")) {
        checkbox.classList.remove("active-cb");
    }
    else {
        checkbox.classList.add("active-cb");
    }
    input.checked = !input.checked
    const platformChecked = input.checked;
    switch(cb.path[0].id) {
      case "twitter":
        this.twitter.feed = platformChecked;
        break;
      case "linkedin":
        this.linkedin.feed = platformChecked;
        break;
      case "facebook":
        this.facebook.feed = platformChecked;
        break;
    }
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
    const twitter = (this.twitter.connected && this.twitter.feed) ? true : false; // passed to the backend to prevent posting to platformms that the user can't or doesn't want to post to
    const linkedin = (this.linkedin.connected && this.linkedin.feed) ? true : false;
    const facebook = (this.facebook.connected && this.facebook.feed) ? true : false;
    this.http.post("newpost", { headers, post, twitter, linkedin, facebook }, {responseType: "json"}).subscribe((messages: Array<any>) => { // will return either success messages or warnings
      this.loading = false;
      this.messages = messages;
      let clear = true;
      for(let message of this.messages) {
        if(message.success) {
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

  // if all feeds are hidden or no platforms are connected; set disabled to true to disable all buttons and prevent any posting
  disableButtons() {
    return this.disabled = ((
      !this.twitter.feed &&
      !this.linkedin.feed &&
      !this.facebook.feed
      ) || (
      !this.twitter.connected &&
      !this.linkedin.connected &&
      !this.twitter.connected
      )) ? true : false;
  }
}
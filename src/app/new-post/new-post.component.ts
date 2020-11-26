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

  error: boolean = false;
  success: boolean = false;
  
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
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.post("newpost", { headers, post }, {responseType: "json"}).subscribe((post: any) => {
      if(post.success === false) {
        (<HTMLElement>document.querySelector(".error")).innerHTML = post.message;
        this.errorMessage();
      }
      else {
        this.successMessage();
        e.srcElement.reset();
        document.querySelector(".background").setAttribute("style", `width: 0%`);
      }
    });
  }

  // if all feeds are hidden or no platforms are connected; set disabled to true to disable all buttons and prevent any posting
  disableButtons() {
    this.disabled = ((
      !this.twitter.feed &&
      !this.linkedin.feed &&
      !this.facebook.feed
      ) || (
      !this.twitter.connected &&
      !this.linkedin.connected &&
      !this.twitter.connected
      )) ? true : false;
  }

  errorMessage() {
    this.error = true;
    setTimeout(() => this.error = false, 3000);
  }

  successMessage() {
    this.success = true;
    setTimeout(() => this.success = false, 3000);
  }
}
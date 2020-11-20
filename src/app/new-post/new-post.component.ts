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
  date = null;

  primaryInput = (<HTMLInputElement>document.querySelector(".primary-input"));
  twitterPost = (<HTMLInputElement>document.querySelector(".twitter-input"));
  linkedinPost = (<HTMLInputElement>document.querySelector(".linkedin-input"));
  facebookPost = (<HTMLInputElement>document.querySelector(".facebook-input"));

  primaryPost = "";

  user: any = false;
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.date= this.newDate();
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.get("api/user", { headers }).subscribe(data => {
      this.user = data;
      console.log(this.user);
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
    });
  }

  newDate() {
    let date: any = new Date();
    date = date.toString();
    date = date.substr(4, 6);
    return date;
  }

  clearAll() {
    (<HTMLInputElement>document.querySelector(".primary-input")).innerHTML = "";
    (<HTMLInputElement>document.querySelector(".twitter-input")).innerHTML = "";
    (<HTMLInputElement>document.querySelector(".linkedin-input")).innerHTML = "";
    (<HTMLInputElement>document.querySelector(".facebook-input")).innerHTML = "";
    setTimeout(() => {
      this.heightControl((<HTMLInputElement>document.querySelector(".twitter-input")));
      this.twitterLength();
      this.heightControl((<HTMLInputElement>document.querySelector(".linkedin-input")));
      this.linkedinLength();
      this.heightControl((<HTMLInputElement>document.querySelector(".facebook-input")));
      this.facebookLength()
    }, 1);
  }

  // allows the user to select which field should be cleared, the function is called when a change is made to the clear selector
  clearFields(opt) {
    const val = opt.path[0].value;
    switch(val) {
        case "Clear Primary":
            (<HTMLInputElement>document.querySelector(".primary-input")).value = "";
            break;
        case "Clear Twitter":
            (<HTMLInputElement>document.querySelector(".twitter-input")).value = "";
            (<HTMLInputElement>document.querySelector(".twitter-input")).style.height = "65px";
            this.twitterLength();
            this.heightControl((<HTMLInputElement>document.querySelector(".twitter-input")));
            break;
        case "Clear LinkedIn":
            (<HTMLInputElement>document.querySelector(".linkedin-input")).value = "";
            this.linkedinLength();
            this.heightControl((<HTMLInputElement>document.querySelector(".linkedin-input")));
            break;
        case "Clear Facebook":
            (<HTMLInputElement>document.querySelector(".facebook-input")).value = "";
            this.facebookLength();
            this.heightControl((<HTMLInputElement>document.querySelector(".facebook-input")));
            break;
        default :
        break;
    }
  }

  // this function updates all platform posts with the text entered in the primary post, & prevents changes from being made to platform posts if the platform post has had seperate changes made
  onPrimaryInput(e) {
    const primary = (<HTMLInputElement>document.querySelector(".primary-input"));
    const twitter = (<HTMLInputElement>document.querySelector(".twitter-input"));
    const linkedin = (<HTMLInputElement>document.querySelector(".linkedin-input"));
    const facebook = (<HTMLInputElement>document.querySelector(".facebook-input"));
    let twitterMatch = this.twitterLength();
    let linkedinMatch = this.linkedinLength();
    let facebookMatch = this.facebookLength();
    //setTimeout is required as the input fields don't get updated with the user's input before the code runs - this delay gives it a second to update the value to check the lengths 
    setTimeout(() => {
      this.primaryPost = primary.value;
      primary.value = this.primaryPost;
        if(twitterMatch === true) {twitter.value = primary.value}
        if(linkedinMatch === true) {linkedin.value = primary.value}
        if(facebookMatch === true) {facebook.value = primary.value}
        this.heightControl(twitter);
        this.heightControl(linkedin);
        this.heightControl(facebook);
    }, 1);
  }

  // manages the character length for each platform
  twitterLength() {
    const primary = (<HTMLInputElement>document.querySelector(".primary-input"));
    const twitter = (<HTMLInputElement>document.querySelector(".twitter-input"));
    let twitterCount = (twitter.value.length * 100) / 280;
    (<HTMLElement>document.querySelector(".twitter-limit")).style.width = `${twitterCount}%`;
    this.heightControl(twitter);
    return (twitter.value === primary.value && primary.value.length < 280) ? true: false;
  }

  linkedinLength() {
    const primary = (<HTMLInputElement>document.querySelector(".primary-input"));
    const linkedin = (<HTMLInputElement>document.querySelector(".linkedin-input"));
    let linkedinCount = (linkedin.value.length * 100) / 700;
    (<HTMLElement>document.querySelector(".linkedin-limit")).style.width = `${linkedinCount}%`;
    this.heightControl(linkedin);
    return (linkedin.value === primary.value && primary.value.length < 700) ? true: false;
  }

  facebookLength() {
    const primary = (<HTMLInputElement>document.querySelector(".primary-input"));
    const facebook = (<HTMLInputElement>document.querySelector(".facebook-input"));
    let facebookCount = (facebook.value.length * 100) / 63000;
    (<HTMLElement>document.querySelector(".facebook-limit")).style.width = `${facebookCount}%`;
    this.heightControl(facebook);
    return (facebook.value === primary.value && primary.value.length < 63000) ? true: false;
  }


  // increases the height of each platform container to prevent scrolling
  heightControl(platform) {
    setTimeout(() => {
      platform.style.height = "0px";
      platform.style.height = `${platform.scrollHeight}px`;
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
    const platform = {
      name: cb.path[0].id,
      active: input.checked
    };
    switch(platform.name) {
      case "twitter":
        this.twitter.feed = platform.active;
        break;
      case "linkedin":
        this.linkedin.feed = platform.active;
        break;
      case "facebook":
        this.facebook.feed = platform.active;
        break;
    }
  }

  newPost(e) {
    e.preventDefault();
    const tweet = (<HTMLTextAreaElement>document.querySelector(".twitter-input")).value;
    // add other platform elements when APIs are implimented
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.post("newpost", { headers, tweet }, {responseType: "json"}).subscribe((post: any) => {
      if(post.success === false) {
        (<HTMLElement>document.querySelector(".error")).innerHTML = post.message;
      }
      else {
        (<HTMLFormElement>document.querySelector("form")).submit();
      }
    })
  }
}
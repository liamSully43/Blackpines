import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-my-feed',
  templateUrl: './my-feed.component.html',
  styleUrls: ['./my-feed.component.scss']
})
export class MyFeedComponent implements OnInit {

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

  user: any = {};

  twitterFeed: any = [];
  twitterFeedError: any = false;

  linkedinFeed: any = [];
  linkedinFeedError: any = false;
  
  facebookFeed: any = [];
  facebookFeedError: any = false;

  tweet: any = false;

  twitterAccount: any = false;

  // used to render the loading circle, set to true when the user request info from an api, and is then set to false when data is returned
  loading:boolean = false;
  loadingTwitter: boolean = true;
  loadingLinkedin: boolean = true;
  loadingFacebook: boolean = true;
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.get("api/user", { headers }).subscribe((data: any) => {
      this.twitter = {
        connected: (typeof data.twitterProfile !== "undefined" && data.twitterProfile !== null) ? true : false,
        feed: (typeof data.twitterProfile !== "undefined" && data.twitterProfile !== null) ? true : false
      }
      this.linkedin = {
        connected: (typeof data.linkedinProfile !== "undefined" && data.linkedinProfile !== null) ? true : false,
        feed: (typeof data.linkedinProfile !== "undefined" && data.linkedinProfile !== null) ? true : false
      }
      this.facebook = {
        connected: (typeof data.facebookProfile !== "undefined" && data.facebookProfile !== null) ? true : false,
        feed: (typeof data.facebookProfile !== "undefined" && data.facebookProfile !== null) ? true : false,
      }
      this.user.twitter = (this.twitter.connected) ? data.twitterProfile : {};
      if(this.twitter.connected) this.http.get("api/myfeed", { headers }).subscribe((feed: any) => {
        this.loadingTwitter = false;
        if(feed.success === false) {
          this.twitterFeedError = feed.message;
        }
        else {
          this.twitterFeed = feed
          this.twitterFeedError = false;
        }
      })
    });
  }

  toggleFeed(e) {
      if(e === "single") {
        document.querySelector("main").classList.add("single-feed");
      }
      else {
        document.querySelector("main").classList.remove("single-feed");
      }
  }

  togglePlatforms(platform) {
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

  showTweet(id) {
    this.close();
    this.loading = true;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const postId = id
    this.http.post("api/twitter/tweet/get", { headers, postId }, {responseType: "json"}).subscribe(((result: any) => {
      this.loading = false;
      if(result.success) {
        let time = result.post.created_at;
        let date = result.post.created_at;
        this.tweet = result.post;
        this.tweet.time = time.substr(11, 5);
        this.tweet.date = date.substr(4, 6);
      }
      else {
        this,this.twitterFeedError = result.post;
      }
    }))
  }

  showTwitterAccount(user) {
    this.twitterAccount = user;
  }

  fetchUser(user) {
    this.close();
    this.loading = true;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const params = new HttpParams().set("id", user.userID).set("handle", user.handle);
    this.http.get("api/twitter/account/get", { headers, params }).subscribe((result => {
      this.loading = false;
      this.twitterAccount = result
    }));
  }

  close() {
    this.tweet = false;
    this.twitterAccount = false;
  }
}
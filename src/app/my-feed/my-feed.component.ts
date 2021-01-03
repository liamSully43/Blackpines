import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-my-feed',
  templateUrl: './my-feed.component.html',
  styleUrls: ['./my-feed.component.scss']
})
export class MyFeedComponent implements OnInit {

  user: any = {};
  tweet: any = false;
  twitAccounts: number = 0;
  activeFeed: any = [];
  homeTimelines: any = [];
  userTimelines: any = [];
  twitterAccount: any = false;
  error: any = false;
  expand: boolean = false;

  headers = new HttpHeaders().set("Authorization", "auth-token");

  // used to render the loading circle, set to true when the user request info from an api, and is then set to false when data is returned
  loading:boolean = false;
  loadingFeed:boolean = true;
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const headers = this.headers;
    this.http.get("api/user", { headers }).subscribe((data: any) => {
      this.user.twitter = (data.twitter.length > 0) ? data.twitter : [];
      this.twitAccounts = this.user.twitter.length;
      if(this.twitAccounts > 0) this.getFeed();
    });
  }

  toggleFeed(e) {
    if(e) {
      this.getFeed();
    }
    else {
      this.getPosts();
    }
  }

  getFeed() {
    if(this.homeTimelines.length > 0) return this.activeFeed = this.homeTimelines;
    this.loadingFeed = true;
    const headers = this.headers;
    this.http.get("api/twitter/account/myfeed", { headers }).subscribe((feed: any) => {
      this.loadingFeed = false;
      this.homeTimelines = feed;
      this.activeFeed = feed;
    })
  }

  getPosts() {
    if(this.userTimelines.length > 0) return this.activeFeed = this.userTimelines;
    this.loadingFeed = true;
    const headers = this.headers;
    this.http.get("api/twitter/account/myposts", { headers }).subscribe((posts: any) => {
      this.loadingFeed = false;
      this.userTimelines = posts;
      this.activeFeed = posts;
    })
  }

  showTweet(id) {
    this.clear();
    this.loading = true;
    this.expand = true; // adds the expand animation to preview the tweet and prevents the body from being scrollable when the preview is visible
    const headers = this.headers;
    const postId = id
    this.http.post("api/twitter/tweet/get", { headers, postId }, {responseType: "json"}).subscribe(((result: any) => {
      if(result.success) {
        let time = result.post.created_at;
        let date = result.post.created_at;
        setTimeout(() => {
          this.loading = false;
          this.tweet = result.post;
          this.tweet.time = time.substr(11, 5);
          this.tweet.date = date.substr(4, 6);
        }, 500);
      }
      else {
        this.expand = false;
        this.loading = false;
        this.error = result.post;
        setTimeout(() => this.error = false, 3000);
      }
    }))
  }

  viewUser() {
    const user = {
      userID: this.user.twitter.id_str,
      handle: this.user.twitter.screen_name,
    }
    this.fetchUser(user);
  }

  showTwitterAccount(user) {
    this.clear();
    this.loading = true;
    this.expand = true;
    setTimeout(() => {
      this.loading = false;
      this.twitterAccount = user;
    }, 500);
  }

  fetchUser(user) {
    this.clear();
    this.loading = true;
    this.expand = true;
    const headers = this.headers;
    const params = new HttpParams().set("id", user.userID).set("handle", user.handle);
    this.http.get("api/twitter/account/get", { headers, params }).subscribe(((result: any) => {
      if(!result.success) {
        this.expand = false;
        this.loading = false;
        this.error = "Something went wrong, please try again later";
        setTimeout(() => this.error = false, 3000);
      }
      else {
        setTimeout(() => {
          this.loading = false;
          this.twitterAccount = result.user;
        }, 500);
      }
    }));
  }

  close() {
    this.expand = false;
    this.clear();
  }

  clear() {
    this.tweet = false;
    this.twitterAccount = false;
    this.error = false;
  }
}
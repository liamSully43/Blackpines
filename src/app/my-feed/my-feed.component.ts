import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-my-feed',
  templateUrl: './my-feed.component.html',
  styleUrls: ['./my-feed.component.scss']
})
export class MyFeedComponent implements OnInit {

  user: any = {};
  twitter = {
    connected: false,
    feed: false,
  };
  tweet: any = false;
  twitterFeed: any = [];
  twitterFeedError: any = false;
  twitterAccount: any = false;

  headers = new HttpHeaders().set("Authorization", "auth-token");

  // used to render the loading circle, set to true when the user request info from an api, and is then set to false when data is returned
  loading:boolean = false;
  loadingFeed:boolean = true;
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const headers = this.headers;
    this.http.get("api/user", { headers }).subscribe((data: any) => {
      this.twitter = {
        connected: (typeof data.twitterProfile !== "undefined" && data.twitterProfile !== null) ? true : false,
        feed: (typeof data.twitterProfile !== "undefined" && data.twitterProfile !== null) ? true : false
      }
      this.user.twitter = (this.twitter.connected) ? data.twitterProfile : {};
      if(this.twitter.connected) this.getFeed();
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
    this.loadingFeed = true;
    this.twitterFeed = [];
    const headers = this.headers;
    this.http.get("api/myfeed", { headers }).subscribe((feed: any) => {
      this.loadingFeed = false;
      if(feed.success === false) {
        this.twitterFeedError = feed.message;
      }
      else {
        this.twitterFeed = feed
        this.twitterFeedError = false;
      }
    })
  }

  getPosts() {
    this.loadingFeed = true;
    this.twitterFeed = [];
    const headers = this.headers;
    this.http.get("api/myposts", { headers }).subscribe((posts: any) => {
      this.loadingFeed = false;
      if(posts.success === false) {
        this.twitterFeedError = posts.message;
      }
      else {
        this.twitterFeed = posts;
        this.twitterFeedError = false;
      }
    })
  }

  showTweet(id) {
    this.close();
    this.loading = true;
    const headers = this.headers;
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

  viewUser() {
    const user = {
      userID: this.user.twitter.id_str,
      handle: this.user.twitter.screen_name,
    }
    this.fetchUser(user);
  }

  showTwitterAccount(user) {
    this.twitterAccount = user;
  }

  fetchUser(user) {
    this.close();
    this.loading = true;
    const headers = this.headers;
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
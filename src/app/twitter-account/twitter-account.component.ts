import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from  '@angular/common/http';

@Component({
  selector: 'app-twitter-account',
  templateUrl: './twitter-account.component.html',
  styleUrls: ['./twitter-account.component.scss']
})
export class TwitterAccountComponent implements OnInit {

  @Input() account;
  @Input() userIds;

  @Output() closePreview = new EventEmitter();
  @Output() showTweet = new EventEmitter<string>();
  @Output() showUser = new EventEmitter<object>();

  loading = false;
  accounts = [];
  tweets = [];
  error = false;

  tweetsTitle = false;
  followingTitle = false;
  followersTitle = false;

  ownAccount: boolean = false;
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    document.querySelector("body").addEventListener("keyup", event => (event.key == "Escape") ? this.close() : null); // will close the preview if esc is pressed
    this.getTweets();
  }

  ngOnChanges() {
    this.account.followersRounded = this.roundNumbers(this.account.followers_count);
    this.account.followingRounded = this.roundNumbers(this.account.friends_count);

    // this swaps a lower quality version of the image for a better quality version
    let url = this.account.profile_image_url.replace("normal", "200x200");
    this.account.profile_image_url = url;

    // this detects if the viewed account is one of the user's twitter accounts, if it is the follow button will not be rendered
    for(let id of this.userIds) {
      if(this.account.id_str === id) {
        this.ownAccount = true;
        break;
      }
    }

    this.getTweets();
  }

  // rounds the number of following & followers to the neares 1000 or million
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

  startFollowing() {
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const id = this.account.id_str;
    this.http.post("api/twitter/account/follow", { headers, id }, {responseType: "json"}).subscribe(res => {
      if(res === null) {
        this.showError();
      }
      else {
        this.account.following = res;
      }
    });
  }

  unfollow() {
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const id = this.account.id_str;
    this.http.post("api/twitter/account/unfollow", { headers, id }, {responseType: "json"}).subscribe(res => {
      if(res === null) {
        this.showError();
      }
      else {
        this.account.following = res;
      }
    });
  }

  getTweets() {
    this.tweets = [];
    this.accounts = [];
    this.loading = true;
    this.tweetsTitle = true;
    this.followersTitle = false;
    this.followingTitle = false;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const id = this.account.id_str;
    const params = new HttpParams().set("id", id);
    this.http.get("api/twitter/account/tweets", { headers, params }).subscribe((res: any) => {
      this.loading = false;
      if(res.success) {
        this.accounts = [];
        for(let tweet of res.tweets) {
          if(tweet.retweeted_status) {
            const user = tweet.user;
            const id = tweet.id_str;
            const date = tweet.created_at;
            tweet = tweet.retweeted_status;
              tweet.original_user = user;
              tweet.original_id = id;
              tweet.created_at = date;
          }
      
          // changes the time & date into a more readable format
          let time = tweet.created_at;
          let date = tweet.created_at;
          tweet.time = time.substr(11, 5);
          tweet.date = date.substr(4, 6);
    
          // replaces shortened hrefs from the tweet text
          for(let url of tweet.entities.urls) {
            const text = tweet.text.replace(url.url, "");
            tweet.text = text;
          }
          
          // replaces shortened image hrefs from the tweet text
          for(const prop in tweet.entities) {
            if(prop === "media") { // the media property only shows up if an image is used, unlike the url or hashtag properties
              for(let url of tweet.extended_entities.media) {
                const text = tweet.text.replace(url.url, "📷");
                tweet.text = text;
              }
              break;
            }
          }
          this.tweets.push(tweet);
        }
      }
      else {
        this.showError();
      }
    });
  }

  getFollowing() {
    this.tweets = [];
    this.accounts = [];
    this.loading = true;
    this.tweetsTitle = false;
    this.followersTitle = false;
    this.followingTitle = true;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const id = this.account.id_str;
    const params = new HttpParams().set("id", id);
    this.http.get("api/twitter/account/following", { headers, params }).subscribe((users: any) => {
      if(users.success) {
        console.log(users.accounts.users);
        for(let user of users.accounts.users) {
          user.followersRounded = this.roundNumbers(user.followers_count);
          user.followingRounded = this.roundNumbers(user.friends_count);
          console.log(user);
        }
        this.accounts = [...users.accounts.users];
        this.loading = false;
      }
      else {
        this.loading = false;
        this.showError();
      }
    })
  }

  getFollowers() {
    this.tweets = [];
    this.accounts = [];
    this.loading = true;
    this.tweetsTitle = false;
    this.followersTitle = true;
    this.followingTitle = false;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const id = this.account.id_str;
    const params = new HttpParams().set("id", id);
    this.http.get("api/twitter/account/followers", { headers, params }).subscribe((users: any) => {
      if(users.success) {
        console.log(users.accounts.users);
        for(let user of users.accounts.users) {
          user.followersRounded = this.roundNumbers(user.followers_count);
          user.followingRounded = this.roundNumbers(user.friends_count);
          console.log(user);
        }
        this.accounts = [...users.accounts.users];
        this.loading = false;
      }
      else {
        this.loading = false;
        this.showError();
      }
    })
  }
  
  loadUser(user) {
    this.showUser.next(user);
  }

  loadTweet(id) {
    this.showTweet.next(id);
  }

  showError() {
    this.error = true;
    setTimeout(() => this.error = false, 5000);
  }

  close() {
    this.closePreview.next();
  }

}

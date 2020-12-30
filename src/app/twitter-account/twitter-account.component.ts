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

  loading: boolean = false;
  error: boolean = false;

  selectedResults = "tweets"; // tweets, following, followers
  tweets = {
    searched: false,
    results: [],
  };
  followingAccounts = {
    searched: false,
    results: [],
  };
  followersAccounts = {
    searched: false,
    results: [],
  };
  accounts = []; // used to display who an account follows & who follows them 

  expanded: boolean = false;
  headers = new HttpHeaders().set("Authorization", "auth-token");

  ownAccount: boolean = false;
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    document.querySelector("body").addEventListener("keyup", event => (event.key == "Escape") ? this.close() : null); // will close the preview if esc is pressed
    this.getTweets();

    const params = new HttpParams().set("id", this.account.id_str);
    const headers = this.headers;
    this.http.get("api/twitter/account/isFollowing", { headers, params }).subscribe((following: any) => {
      for(let account of following) {
        for(let user of this.userIds) {
          if(user.id_str === account.id && account.connection === "following") {
            user.following = true;
            break;
          }
        }
      }
    });
  }

  ngOnChanges() {
    this.account.followersRounded = this.roundNumbers(this.account.followers_count);
    this.account.followingRounded = this.roundNumbers(this.account.friends_count);

    console.log(this.account);
    console.log(this.userIds);

    // this swaps a lower quality version of the image for a better quality version
    let url = this.account.profile_image_url.replace("normal", "200x200");
    this.account.profile_image_url = url;
    // this detects if the viewed account is one of the user's twitter accounts, if it is the follow button will not be rendered
    for(let user of this.userIds) {
      if(this.account.id_str === user.id_str) {
        this.ownAccount = true;
        break;
      }
    }

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

  toggleFollow() {
    this.expanded = !this.expanded;
  }

  followInteract(user) {
    if(user.following) {
      this.unfollow(user);
    }
    else {
      this.follow(user);
    }
  }

  follow(user) {
    const headers = this.headers;
    const id = this.account.id_str;
    const userId = user.id_str;
    this.http.post("api/twitter/account/follow", { headers, id, userId }, {responseType: "json"}).subscribe(res => {
      if(res === null) {
        this.showError();
      }
      else {
        user.following = res;
      }
    });
  }

  unfollow(user) {
    const headers = this.headers;
    const id = this.account.id_str;
    const userId = user.id_str;
    this.http.post("api/twitter/account/unfollow", { headers, id, userId }, {responseType: "json"}).subscribe(res => {
      if(res === null) {
        this.showError();
      }
      else {
        user.following = res;
      }
    });
  }

  getTweets() {
    this.selectedResults = "tweets";
    if(this.tweets.searched) return;
    this.loading = true;
    const headers = this.headers;
    const id = this.account.id_str;
    const params = new HttpParams().set("id", id);
    this.http.get("api/twitter/account/tweets", { headers, params }).subscribe((res: any) => {
      this.loading = false;
      if(res.success) {
        this.tweets.searched = true;
        console.log(res.tweets);
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
            const text = tweet.full_text.replace(url.url, "");
            tweet.full_text = text;
          }
          
          // replaces shortened image hrefs from the tweet text
          for(const prop in tweet.entities) {
            if(prop === "media") { // the media property only shows up if an image is used, unlike the url or hashtag properties
              for(let url of tweet.extended_entities.media) {
                const text = tweet.full_text.replace(url.url, "📷");
                tweet.full_text = text;
              }
              break;
            }
          }
          this.tweets.results.push(tweet);
        }
        console.log(this.tweets);
      }
      else {
        this.showError();
        this.loading = false;
      }
    });
  }

  getFollowing() {
    this.selectedResults = "following";
    if(this.followingAccounts.searched) {
      this.accounts = this.followingAccounts.results;
      return;
    }
    this.loading = true;
    const headers = this.headers;
    const id = this.account.id_str;
    const params = new HttpParams().set("id", id);
    this.http.get("api/twitter/account/following", { headers, params }).subscribe((users: any) => {
      if(users.success) {
        this.followingAccounts.searched = true;
        console.log(users.accounts.users);
        for(let user of users.accounts.users) {
          user.followersRounded = this.roundNumbers(user.followers_count);
          user.followingRounded = this.roundNumbers(user.friends_count);
        }
        this.accounts = [];
        this.followingAccounts.results = [...users.accounts.users];
        this.accounts = [...users.accounts.users];
      }
      else {
        this.showError();
      }
      this.loading = false;
    })
  }

  getFollowers() {
    this.selectedResults = "followers";
    if(this.followersAccounts.searched) {
      this.accounts = this.followersAccounts.results;
      return;
    }
    this.loading = true;
    const headers = this.headers;
    const id = this.account.id_str;
    const params = new HttpParams().set("id", id);
    this.http.get("api/twitter/account/followers", { headers, params }).subscribe((users: any) => {
      if(users.success) {
        this.followersAccounts.searched = true;
        console.log(users.accounts.users);
        for(let user of users.accounts.users) {
          user.followersRounded = this.roundNumbers(user.followers_count);
          user.followingRounded = this.roundNumbers(user.friends_count);
        }
        this.accounts = [];
        this.followersAccounts.results = [...users.accounts.users];
        this.accounts = [...users.accounts.users];
      }
      else {
        this.showError();
      }
      this.loading = false;
    })
  }
  
  loadUser(user) {
    console.log(user);
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

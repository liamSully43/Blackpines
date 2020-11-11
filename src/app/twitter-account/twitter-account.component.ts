import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from  '@angular/common/http';

@Component({
  selector: 'app-twitter-account',
  templateUrl: './twitter-account.component.html',
  styleUrls: ['./twitter-account.component.scss']
})
export class TwitterAccountComponent implements OnInit {

  @Input() account;

  @Output() closePreview = new EventEmitter();
  @Output() showTweet = new EventEmitter<string>();

  loading = false;
  accounts = [];
  tweets = [];
  error = false;
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    document.querySelector("body").addEventListener("keyup", event => (event.key == "Escape") ? this.close() : null); // will close the preview if esc is pressed
    this.getTweets();
  }

  ngOnChanges() {
    console.log(this.account);
    this.account.followersRounded = this.roundNumbers(this.account.followers_count);
    this.account.followingRounded = this.roundNumbers(this.account.friends_count);

    // this swaps a lower quality version of the image for a better quality version
    let url = this.account.profile_image_url.replace("normal", "200x200");
    this.account.profile_image_url = url;
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
    this.http.post("api/twitter/follow", { headers, id }, {responseType: "json"}).subscribe(res => {
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
    this.http.post("api/twitter/unfollow", { headers, id }, {responseType: "json"}).subscribe(res => {
      if(res === null) {
        this.showError();
      }
      else {
        this.account.following = res;
      }
    });
  }

  getTweets() {
    this.loading = true;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const id = this.account.id_str;
    const params = new HttpParams().set("id", id);
    this.http.get("api/twitter/getUsersTweets", { headers, params }).subscribe((res: any) => {
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
        console.log("err");
        this.showError();
      }
    });
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

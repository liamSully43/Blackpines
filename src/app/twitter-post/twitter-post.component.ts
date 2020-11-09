import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http'

@Component({
  selector: 'app-twitter-post',
  templateUrl: './twitter-post.component.html',
  styleUrls: ['./twitter-post.component.scss']
})
export class TwitterPostComponent implements OnInit {
  @Input() tweet;

  @Output() close = new EventEmitter<string>();
  @Output() updateTweet = new EventEmitter<string>();
  @Output() showUser = new EventEmitter<string>();

  liked = false;
  error = false;
  success = false;

  links = [];
  linksQuote = [];
  imgUrls = [];
  imgUrlsQuote = [];

  quoteTweet: any = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    document.querySelector("body").addEventListener("keyup", event => (event.key == "Escape") ? this.closeTweet() : null); // will close a tweet if esc is pressed
  }

  ngOnChanges() {
    // this updates the original tweet details with the retweeted tweets details for the various filter functions
    if(this.tweet.retweeted_status) {
      const user = this.tweet.user;
      this.tweet = this.tweet.retweeted_status;
      this.tweet.original_user = user;
    }

    console.log(this.tweet);
    if(this.tweet !== {}) {
      this.tweet.likesRounded = this.roundNumbers(this.tweet.favorite_count);
      this.tweet.retweetsRounded = this.roundNumbers(this.tweet.retweet_count);

      // changes the time & date into the correct format
      let time = this.tweet.created_at;
      let date = this.tweet.created_at;
      this.tweet.time = time.substr(11, 5);
      this.tweet.date = date.substr(4, 6);
      this.links = [];
      this.linksQuote = [];
      this.imgUrls = [];
      this.imgUrlsQuote = [];
      this.filterTweet(this.tweet, "original");
      if(this.tweet.quoted_status) {
        this.filterTweet(this.tweet.quoted_status, "quoted");
      }
    }
  }

  // round down numbers to nearest 1000 or million
  roundNumbers(num) {
    if(num >= 1000 && num <= 999999) { // if the tweet has between 1000 & 999,999 retweets/likes then round down to the nearest 1000
      num = Math.floor(num/1000)
      num += "K";
    }
    if(num >= 1000000) { // if the tweet has more than 1,000,000 retweets/likes then round down to the nearest million
      num = Math.floor(num/1000000);
      num += "M";
    }
    return num;
  }

  // swaps the shortened urls of external links & media with the correct links & actual media
  filterTweet(tweet, source) {
    // replaces the shortened href with the actual href
    if(tweet.entities.urls.length > 0) {
      for(let url of tweet.entities.urls) {
        const text = tweet.full_text.replace(url.url, "");
        tweet.full_text = text;
        if(source === "original" && (!tweet.quoted_status_permalink || url.display_url !== tweet.quoted_status_permalink.display)) {
          const link = {
            displayUrl: url.display_url,
            expandedUrl: url.expanded_url,
          }
          this.links.push(link);
        }
        else if(source === "quoted" && (!tweet.quoted_status_permalink || url.display_url !== tweet.quoted_status_permalink.display)) {
          const link = {
            displayUrl: url.display_url,
            expandedUrl: url.expanded_url,
          }
          this.linksQuote.push(link);
        }
      }
    }

    // replaces the image href with the camera emoji
    for(const prop in tweet.entities) {
      if(prop === "media") { // the media property only shows up if an image or video is used, unlike the url or hashtag properties
        for(let url of tweet.extended_entities.media) {
          const text = tweet.full_text.replace(url.url, "");
          tweet.full_text = text;
          if(source === "original") {
            this.imgUrls.push(url);
          }
          else {
            this.imgUrlsQuote.push(url);
          }
        }
        break;
      }
    }
  }

  closeTweet() {
    this.close.next();
  }

  likeTweet() {
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const id = this.tweet.id_str;
    this.http.post("api/tweet/like", { headers, id }, {responseType: "json"}).subscribe((liked => {
      if(liked === null) {
        this.errorThrown();
      }
      else if(liked) {
        this.liked = true;
        this.tweet.favorite_count++;
        this.tweet.likesRounded = this.roundNumbers(this.tweet.favorite_count);
      }
      else {
        this.liked = false;
        this.tweet.favorite_count--;
        this.tweet.likesRounded = this.roundNumbers(this.tweet.favorite_count);
      }
    }))
  }

  retweet() {
    const headers = new HttpHeaders().set("Authorization", "auth-token");
      const id = this.tweet.id_str;
      this.http.post("api/tweet/retweet", { headers, id}, {responseType: "json"}).subscribe((response => {
        if(response === null) {
          this.errorThrown();
        }
        else if(response) {
          (<HTMLImageElement>document.querySelector(".retweet")).classList.add("selected");
          this.successThrown();
          this.tweet.retweet_count++;
          this.tweet.retweetsRounded = this.roundNumbers(this.tweet.retweet_count);
        }
        else {
          (<HTMLImageElement>document.querySelector(".retweet")).classList.remove("selected");
          this.tweet.retweet_count--;
          this.tweet.retweetsRounded = this.roundNumbers(this.tweet.retweet_count);
        }
      }))
  }

  // checks the length of the reply to prevent user's from being able to reply to tweets with an empty tweet
  checkLength() {
    setTimeout(() => {
      const reply = <HTMLInputElement><unknown>document.querySelector(".reply");
      const tweet = reply.value;
      (<HTMLButtonElement>document.querySelector(".submit")).disabled = (tweet.length < 1) ? true : false;
    }, 1); // 1 milisecond delay required to update value with user's input, otherwise the last character they typed does not get included
  }

  addReply(e) {
    e.preventDefault();
    const reply = <HTMLInputElement><unknown>document.querySelector(".reply");
    const tweet = reply.value;
    if(tweet.length > 0) {
      const headers = new HttpHeaders().set("Authorization", "auth-token");
      const id = this.tweet.id_str;
      const handle = this.tweet.user.screen_name;
      this.http.post("api/tweet/reply", { headers, id, tweet, handle }, {responseType: "json"}).subscribe((response => {
        if(response) {
          this.successThrown();
          reply.value = "";
        }
        else {
          this.errorThrown();
        }
      }));
    }
  }

  expandTweet() {
    this.updateTweet.next(this.tweet.quoted_status.id_str);
  }
  
  loadUser(userID) {
    this.showUser.next(userID)
  }

  successThrown() {
    this.success = true;
    setTimeout(() => this.success = false, 5000);
  }

  errorThrown() {
    this.error = true;
    setTimeout(() => this.error = false, 5000);
  }
}

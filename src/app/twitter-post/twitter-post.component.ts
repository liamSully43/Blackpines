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

  liked = false;
  error = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    document.querySelector("body").addEventListener("keyup", event => (event.key == "Escape") ? this.closeTweet() : null); // will close a tweet if esc is pressed
  }

  ngOnChanges() {
    console.log(this.tweet);
    if(this.tweet !== {}) {
      let retweets = this.tweet.retweet_count;
      let likes = this.tweet.favorite_count;
      // round down num of retweets
      if(retweets >= 1000 && retweets <= 999999) { // if the tweet has between 1000 & 999,999 retweets then round down to the nearest 1000
        retweets = Math.floor(retweets/1000)
        retweets += "K";
        this.tweet.retweet_count = retweets;
      }
      else if(retweets >= 1000000) { // if the tweet has more than 1,000,000 retweets then round down to the nearest million
        retweets = Math.floor(retweets/1000000);
        retweets += "M";
        this.tweet.retweet_count = retweets;
      }
      
      // round down num of likes
      if(likes >= 1000 && likes <= 999999) {
        likes = Math.floor(likes/1000)
        likes += "K";
        this.tweet.favorite_count = likes;
      }
      else if(likes >= 1000000) {
        likes = Math.floor(likes/1000000);
        likes += "M";
        this.tweet.favorite_count = likes;
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
      }
      else {
        this.liked = false;
      }
    }))
  }

  retweet() {

  }

  errorThrown() {
    this.error = true;
    setTimeout(() => this.error = false, 5000);
  }
}

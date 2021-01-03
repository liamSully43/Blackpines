import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http'

@Component({
  selector: 'app-twitter-post',
  templateUrl: './twitter-post.component.html',
  styleUrls: ['./twitter-post.component.scss']
})
export class TwitterPostComponent implements OnInit {
  @Input() tweet;
  @Input() accounts;

  @Output() close = new EventEmitter<string>();
  @Output() updateTweet = new EventEmitter<string>();
  @Output() showUser = new EventEmitter<object>();
  @Output() fetchUserEvent = new EventEmitter<object>();

  headers = new HttpHeaders().set("Authorization", "auth-token");

  liked: boolean = false;
  likesCount: number = 0;
  retweeted: boolean = false;
  retweetCount: number = 0;
  messages: any = [];

  links = [];
  linksQuote = [];
  imgUrls = [];
  imgUrlsQuote = [];

  quoteTweet: any = false;
  selectedUsers: Array<any> = [];
  noUsersSelected: boolean = false;

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

      // this swaps a lower quality version of the image for a better quality version
      let url = this.tweet.user.profile_image_url.replace("normal", "200x200");
      this.tweet.user.profile_image_url = url;
      if(this.tweet.quoted_status) {
        url = this.tweet.quoted_status.user.profile_image_url.replace("normal", "200x200");
        this.tweet.quoted_status.user.profile_image_url = url;
      }

      this.filterTweet(this.tweet, "original");
      if(this.tweet.quoted_status) {
        this.filterTweet(this.tweet.quoted_status, "quoted");
      }
    }
  }

  // rounds numbers to the neares 1000 or million
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

  toggleAccount(e) {
    const ele = e.target;
    if(ele.classList.contains("selected")) {
      ele.classList.remove("selected");
      const i = this.selectedUsers.indexOf(ele.id);
      this.selectedUsers.splice(i, 1);
    }
    else {
      ele.classList.add("selected");
      this.selectedUsers.push(ele.id);
    }
  }

  likeTweet() {
    // if no users are selected
    if(this.selectedUsers.length < 1) {
      this.noUsersSelected = true;
      const message = {
        success: false,
        message: "Please select at least one user",
      }
      this.messages.push(message);
      this.clearMessages();
      return;
    }
    const headers = this.headers;
    const id = this.tweet.id_str;
    const accounts = this.selectedUsers;
    this.http.post("api/twitter/tweet/like", { headers, id, accounts }, {responseType: "json"}).subscribe(((messages: any) => {
      this.deselectUsers(); // deselects users
      this.messages = messages;
      // updates the like count
      for(let message of messages) {
        if(message.success) {
          this.likesCount++;
          this.tweet.favorite_count++;
          this.tweet.likesRounded = this.roundNumbers(this.tweet.favorite_count);
        }
        else if (!message.success) {
          this.likesCount--;
          this.tweet.favorite_count--;
          this.tweet.likesRounded = this.roundNumbers(this.tweet.favorite_count);
        }
      }
      // prevents any erros with showning if the user has liked the tweet - if the user unlikes a tweet they've previously liked then the counter will go to -1
      if(this.likesCount < 0) {
        this.likesCount = 0;
      }
      if(this.tweet.favorite_count < 0) {
        this.tweet.favorite_count = 0;
        this.tweet.likesRounded = 0;
      }
      this.liked = (this.likesCount > 0) ? true: false; // highlights the like button if at least 1 account has liked the tweet 
      this.clearMessages();
    }));
  }

  retweet() {
    if(this.selectedUsers.length < 1) {
      this.noUsersSelected = true;
      const message = {
        success: false,
        message: "Please select at least one user",
      }
      this.messages.push(message);
      this.clearMessages();
      return;
    }
    const headers = this.headers;
    const id = this.tweet.id_str;
    const accounts = this.selectedUsers;
    this.http.post("api/twitter/tweet/retweet", { headers, id, accounts }, {responseType: "json"}).subscribe(((messages: any) => {
      this.deselectUsers();
      this.messages = messages;
      // updates the retweet count
      for(let message of messages) {
        if(message.success) {
          this.retweetCount++;
          this.tweet.retweet_count++;
          this.tweet.retweetsRounded = this.roundNumbers(this.tweet.retweet_count);
        }
        else if (!message.success) {
          this.retweetCount--;
          this.tweet.retweet_count--;
          this.tweet.retweetsRounded = this.roundNumbers(this.tweet.retweet_count);
        }
      }
      // prevents any erros with showning if the user has retweeted the tweet - if the user unretweets a tweet they've previously retweeted then the counter will go to -1
      if(this.retweetCount < 0) {
        this.retweetCount = 0;
      }
      if(this.tweet.retweet_count < 0) {
        this.tweet.retweet_count = 0;
        this.tweet.retweetsRounded = 0;
      }
      this.retweeted = (this.retweetCount > 0) ? true: false; // highlights the retweet button if at least 1 account has liked the tweet 
      this.clearMessages();
    }))
  }

  addReply(e) {
    e.preventDefault();
    if(this.selectedUsers.length < 1) {
      this.noUsersSelected = true;
      const message = {
        success: false,
        message: "Please select at least one user",
      }
      this.messages.push(message);
      this.clearMessages();
      return;
    }
    const reply = <HTMLInputElement><unknown>document.querySelector(".reply");
    const tweet = reply.value;
    if(tweet.length > 0) {
      const headers = this.headers;
      const id = this.tweet.id_str;
      const handle = this.tweet.user.screen_name;
      const accounts = this.selectedUsers;
      this.http.post("api/twitter/tweet/reply", { headers, id, tweet, handle, accounts }, {responseType: "json"}).subscribe((messages => {
        this.deselectUsers();
        this.messages = messages;
        for(let message of this.messages) {
          if(message.success) {
            reply.value = "";
            break;
          }
        }
        this.clearMessages();
      }));
    }
  }

  // removes the selected class from each account that was selected by the user
  deselectUsers() {
    document.querySelectorAll(".selected").forEach(ele => {
      ele.classList.remove("selected");
    });
    this.selectedUsers = [];
  }

  // checks the length of the reply to prevent user's from being able to reply to tweets with an empty tweet
  checkLength() {
    setTimeout(() => {
      const reply = <HTMLInputElement><unknown>document.querySelector(".reply");
      const tweet = reply.value;
      (<HTMLButtonElement>document.querySelector(".submit")).disabled = (tweet.length < 1) ? true : false;
    }, 1); // 1 milisecond delay required to update value with user's input, otherwise the last character they typed does not get included
  }

  expandTweet() {
    this.updateTweet.next(this.tweet.quoted_status.id_str);
  }

  loadQuotedUser(e, user) {
    e.stopPropagation();
    this.loadUser(user);
  }
  
  loadUser(user) {
    this.closeTweet();
    this.showUser.next(user)
  }

  fetchUser(e, user) {
    e.stopPropagation();
    const userInfo = {
      userID: user.id_str,
      handle: user.screen_name,
    }
    this.fetchUserEvent.next(userInfo);
  }

  clearMessages() {
    setTimeout(() => {
      this.noUsersSelected = false;
      this.messages = []
    }, 7000);
  }
}
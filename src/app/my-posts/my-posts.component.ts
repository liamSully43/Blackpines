import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-my-posts',
  templateUrl: './my-posts.component.html',
  styleUrls: ['./my-posts.component.scss']
})
export class MyPostsComponent implements OnInit {

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

  twitterPosts: any = [];
  linkedinPosts: any = [];
  facebookPosts: any = [];

  twitterError: any = false;
  firstSearch = true;
  failedSearch = false;
  tweet: any = false;
  
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
      if(this.twitter.connected) this.http.get("api/myposts", { headers }).subscribe((posts: any) => {
        if(posts.success === false) {
          this.twitterError = posts.message;
        }
        else {
          this.twitterPosts = posts;
          this.twitterError = false;
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
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const postId = id
    this.http.post("api/getTwitterPost", { headers, postId }, {responseType: "json"}).subscribe(((result: any) => {
      if(result.success) {
        let time = result.post.created_at;
        let date = result.post.created_at;
        this.tweet = result.post;
        this.tweet.time = time.substr(11, 5);
        this.tweet.date = date.substr(4, 6);
        console.log(this.tweet);
      }
      else {
        this.firstSearch = false;
        this.failedSearch = true;
      }
    }))
  }

  close() {
    this.tweet = false;
  }
}
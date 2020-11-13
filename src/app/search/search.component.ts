import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  // connected should always be set to true - the platforms don't need to rely on what the user is connected to as not user spcecific credential's are necessary
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

  twitterResults = [];
  firstSearch = true;
  failedSearch = false;
  
  searchType = "Users";
  
  twitterPosts: any = [];
  linkedinPosts: any = [];
  facebookPosts: any = [];
  
  twitterPostsError: any = false;
  tweet: any = false;
  
  twitterAccount: any = false;
  
  // used to render the loading circle, set to true when the user request info from an api, and is then set to false when data is returned
  loading: any = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.get("api/user", { headers }).subscribe((data: any) => {
      this.twitter = {
        connected: (typeof data.twitterProfile !== "undefined" && data.twitterProfile !== null) ? true : false,
        feed: (typeof data.twitterProfile !== "undefined" && data.twitterProfile !== null) ? true : false
      }
      this.user.twitter = (this.twitter.connected) ? data.twitterProfile : {};
    })
  }

  toggleSearch = () => {
    const type = <HTMLSelectElement><unknown>document.querySelector("select");
    this.searchType = type.value; // Users or Posts
    this.twitterResults = []; // used to prevent an errors - the data pased back from search queries will vary depending on if users or posts are searched for
    this.search(); // called to update results based off of type of search
  }

  submitForm(e) {
    e.preventDefault();
    this.search();
  }

  search() {
    const searchTerm = (<HTMLInputElement>document.querySelector(".search")).value;
    if(searchTerm.length < 1) return;
    this.loading = true;
    this.failedSearch = false;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const type = this.searchType;
    this.http.post("api/search", { headers, searchTerm, type }, {responseType: "json"}).subscribe(((result: any) => {
      this.firstSearch = false;
      this.loading = false;
      if(result.success) {
        if(this.searchType === "Users") { // if user's was searched for
          let users = result.results;
          for(let user of users) {
            let followers = user.followers_count;
            let following = user.friends_count;
            // round down num of followers
            if(followers >= 1000 && followers <= 999999) { // if the user has between 1000 & 999,999 followers then round down to the nearest 1000
              followers = Math.floor(followers/1000)
              followers += "K";
              user.followers_count = followers;
            }
            else if(followers >= 1000000) { // if the user has more than 1,000,000 followers then round down to the nearest million
              followers = Math.floor(followers/1000000);
              followers += "M";
              user.followers_count = followers;
            }

            // round down num of following
            if(following >= 1000 && following <= 999999) {
              following = Math.floor(following/1000)
              following += "K";
              user.friends_count = following;
            }
            else if(following >= 1000000) {
              following = Math.floor(following/1000000);
              following += "M";
              user.friends_count = following;
            }

            // this swaps a lower quality version of the image for a better quality version
            let url = user.profile_image_url.replace("normal", "200x200");
            user.profile_image_url = url;
          }
          this.twitterResults = result.results;
        }
        else { // if posts were searched for
          this.twitterResults = result.results.statuses;
        }
      }
      else {
        this.twitterResults = [];
        this.failedSearch = true;
      }
    }))
  }

  showPost(id) {
    this.close();
    this.loading = true;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const postId = id
    this.http.post("api/getTwitterPost", { headers, postId }, {responseType: "json"}).subscribe(((result: any) => {
      this.loading = false;
      if(result.success) {
        let time = result.post.created_at;
        let date = result.post.created_at;
        this.tweet = result.post;
        this.tweet.time = time.substr(11, 5);
        this.tweet.date = date.substr(4, 6);
        console.log(this.tweet);
      }
      else {
        this,this.twitterPostsError = result.post;
        console.log(result.post);
      }
    }))
  }

  showTwitterAccount(user) {
    this.twitterAccount = user
  }

  fetchUser(user) {
    this.loading = true;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const params = new HttpParams().set("id", user.userID).set("handle", user.handle);
    this.http.get("api/getTwitterAccount", { headers, params }).subscribe((result => {
      this.loading = false;
      this.twitterAccount = result
    }));
  }

  close() {
    this.tweet = false;
    this.twitterAccount = false;
  }

}
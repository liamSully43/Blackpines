import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  twitter = {
    connected: false,
    feed: false,
  };

  user: any = {};
  searchQuery: string;

  tweets = {
    lastQuery: "",
    results: [],
  };
  users = {
    lastQuery: "",
    results: [],
  };
  firstSearch = true;
  failedSearch = false;
  
  searchType = "Users";
  
  twitterTweetsError: any = false;
  tweet: any = false;
  
  twitterAccount: any = false; // this is used to display a user's profile
  
  // used to render the loading circle, set to true when the user request info from an api, and is then set to false when data is returned
  loading: any = false;
  expand: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.get("api/user", { headers }).subscribe((data: any) => {
      this.twitter = {
        connected: (data.twitter.length > 0) ? true : false,
        feed: (data.twitter.length > 0) ? true : false
      }
      this.user.twitter = (this.twitter.connected) ? data.twitter : {};
    })
  }

  toggleSearch = () => {
    const type = <HTMLSelectElement><unknown>document.querySelector("select");
    this.searchType = type.value; // Users or Tweets
    this.search(); // called to update results based off of type of search
  }

  submitForm(e) {
    e.preventDefault();
    this.search();
  }

  search() {
    const query = this.searchQuery;
    if(query.length < 1 || !this.twitter.connected) return; // prevents searches if twitter isn't connected or if there is no search term entered
    // prevents unnecessary searches if the search term matches the previously searched term for the current type of search shown/selected
    if((this.searchType === "Users" && this.users.lastQuery === query) || (this.searchType === "Tweets" && this.tweets.lastQuery === query)) return;
    if(this.searchType === "Users") {
      this.users = {
        lastQuery: query,
        results: [],
      }
    }
    else {
      this.tweets = {
        lastQuery: query,
        results: [],
      }
    }
    this.loading = true;
    this.failedSearch = false;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const type = this.searchType;
    this.http.post("api/search", { headers, query, type }, {responseType: "json"}).subscribe(((result: any) => {
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
          this.users.results = result.results;
        }
        else { // if posts were searched for
          this.tweets.results = result.results.statuses;
        }
      }
      else {
        this.failedSearch = true;
      }
    }))
  }

  showPost(id) {
    this.clear();
    this.loading = true;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const postId = id
    this.http.post("api/twitter/tweet/get", { headers, postId }, {responseType: "json"}).subscribe(((result: any) => {
      if(result.success) {
        this.expand = true;
        setTimeout(() => {
          let time = result.post.created_at;
          let date = result.post.created_at;
          this.loading = false;
          this.tweet = result.post
          this.tweet.time = time.substr(11, 5);
          this.tweet.date = date.substr(4, 6);
        }, 500);
      }
      else {
        this.twitterTweetsError = result.post;
      }
    }))
  }

  showTwitterAccount(user) {
    this.clear();
    this.loading = true;
    this.expand = true;
    setTimeout(() => {
      this.loading = false;
      this.twitterAccount = user
    }, 500);
  }

  fetchUser(user) {
    this.clear();
    this.loading = true;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const params = new HttpParams().set("id", user.userID).set("handle", user.handle);
    this.http.get("api/twitter/tweet/get", { headers, params }).subscribe((result => {
      this.expand = true;
      setTimeout(() => {
        this.loading = false;
        this.twitterAccount = result
      }, 500);
    }));
  }

  setSearchQuery(e) {
    this.searchQuery = e.target.value;
  }

  close() {
    this.expand = false;
    this.clear();
  }

  clear() {
    this.tweet = false;
    this.twitterAccount = false;
  }

}
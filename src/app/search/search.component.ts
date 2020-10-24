import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

  twitterResults = [];
  linkedInResults = [];
  facebookResults = [];

  searchType = "user";

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
    })
  }

  toggleSearch = searchQuery => {
    this.searchType = searchQuery // post or user
    this.twitterResults = []; // used to prevent an errors - the data pased back from search queries will vary depending on if users or posts are searched for
    this.search(); // called to update results based off of type of search
  }

  togglePlatforms(platform) {
    // platform keys = name & active
    switch(platform.name) {
      case "twitter":
        this.twitter.feed = platform.active
        break;
      case "linkedin":
        this.linkedin.feed = platform.active
        break;
      case "facebook":
        this.facebook.feed = platform.active
        break;
    }
  }

  submitForm(e) {
    e.preventDefault();
    this.search();
  }

  search() {
    const searchTerm = (<HTMLInputElement>document.querySelector(".search")).value;
    if(searchTerm.length < 1) return;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const twitter = this.twitter.feed;
    const linkedin = this.linkedin.feed;
    const facebook = this.facebook.feed;
    const type = this.searchType;
    this.http.post("api/search", { headers, searchTerm, twitter, linkedin, facebook, type }, {responseType: "json"}).subscribe(((result: any) => {
      if(result.twitter.success || result.linkedin.success || result.facebook.success) {
        if(this.searchType === "user") {
          this.twitterResults = result.twitter.results;
          console.log(this.twitterResults);
        }
        else {
          this.twitterResults = result.twitter.results.statuses;
        }
      }
      else {
        console.log("not successful");
      }
    }))
  }
}

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

  searchType = "Users";

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.get("api/user", { headers }).subscribe((data: any) => {
      this.twitter = {
        connected: (typeof data.twitterProfile !== "undefined" && data.twitterProfile !== null) ? true : false,
        feed: (typeof data.twitterProfile !== "undefined" && data.twitterProfile !== null) ? true : false
      }
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
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const type = this.searchType;
    this.http.post("api/search", { headers, searchTerm, type }, {responseType: "json"}).subscribe(((result: any) => {
      if(result.success) {
        if(this.searchType === "Users") {
          this.twitterResults = result.results;
          console.log(this.twitterResults);
        }
        else {
          this.twitterResults = result.results.statuses;
          console.log(this.twitterResults);
        }
      }
      else {
        console.log("not successful");
      }
    }))
  }
}

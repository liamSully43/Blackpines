import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  twitter = {
    connected: true,
    feed: true,
  };
  linkedin = {
    connected: true,
    feed: true,
  };
  facebook = {
    connected: true,
    feed: true,
  };

  constructor() { }

  ngOnInit(): void { }

  toggleSearch(searchQuery) {
    console.log(searchQuery) // post, user or both
  }

  togglePlatforms(platform) {
    // platform keys = name & active
    switch(platform.name) {
      case "twitter":
        console.log(platform)
        break;
      case "linkedin":
        console.log(platform)
        break;
      case "facebook":
        console.log(platform)
        break;
    }
  }
}

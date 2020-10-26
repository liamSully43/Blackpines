import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {

  @Input() feed; // used to detect if the feed toggle html is needed
  
  // used to pass back what platforms should be connected
  @Input() twitter: any = {
    connected: false,
    feed: false,
  };
  @Input() linkedin: any = {
    connected: false,
    feed: false,
  };
  @Input() facebook: any = {
    connected: false,
    feed: false,
  };

  @Output() toggleFeedMethod = new EventEmitter<string>(); // passes what feed option the user has selected to /my-feed or /my-posts
  @Output() platformFeeds = new EventEmitter<object>(); // passes back the value of a platform check box to /my-feed, /my-posts or /new-post to toggle the components/html on those pages
  @Output() toggleSearchMethod = new EventEmitter<string>(); // passes back what search type the user has selected for /search

  platformArray = [];

  constructor() { }

  ngOnInit(): void { }

  // toggles the checkboxes when clicked - necessary for custom checkboxes
  toggle(cb) {
    const checkbox = (<HTMLInputElement>cb.srcElement); // the visible green "checkbox"
    const input = cb.path[1].childNodes[0]; // the hidden actual checkbox
    if(checkbox.classList.contains("active-cb")) {
        checkbox.classList.remove("active-cb");
    }
    else {
        checkbox.classList.add("active-cb");
    }
    input.checked = !input.checked
    const platform = {
      name: cb.path[0].id,
      active: input.checked
    };
    this.platformFeeds.next(platform);
  }

  // passes back what feed formatting the user wants
  toggleFeed(e) {
    if(e.path[0].value === "Single Feed") {
      this.toggleFeedMethod.next("single");
    }
    else {
      this.toggleFeedMethod.next("multi");
    }
  }
}

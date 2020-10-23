import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {

  @Input() feed;
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
  @Output() toggleFeedMethod = new EventEmitter<string>();
  @Output() platformFeeds = new EventEmitter<object>();

  platformArray = [];

  constructor() { }

  ngOnInit(): void { }

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

  toggleFeed(e) {
    if(e.path[0].value === "Single Feed") {
      this.toggleFeedMethod.next("single");
    }
    else {
      this.toggleFeedMethod.next("multi");
    }
  }

}

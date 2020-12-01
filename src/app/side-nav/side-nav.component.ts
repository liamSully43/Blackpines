import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {

  myFeed: boolean = true;

  @Input() users: Array<any>;

  @Output() activityFeed = new EventEmitter<boolean>();
  @Output() viewUser = new EventEmitter<Object>();

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges() {
    for(let account of this.users) {
      const url = account.profile_image_url.replace("normal", "200x200");
      account.profile_image_url = url;
    }
  }

  toggleFeed() {
    this.myFeed = !this.myFeed;
    this.activityFeed.next(this.myFeed);
  }

  viewAccount() {
    this.viewUser.next(this.users);
  }
}

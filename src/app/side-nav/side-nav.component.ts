import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {

  myFeed: boolean = true;

  @Output() activityFeed = new EventEmitter<boolean>();
  @Output() viewUser = new EventEmitter();

  constructor() { }

  ngOnInit(): void { }

  toggleFeed() {
    this.myFeed = !this.myFeed;
    this.activityFeed.next(this.myFeed);
  }

  viewAccount() {
    this.viewUser.next();
  }
}

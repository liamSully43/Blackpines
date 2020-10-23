import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-feed-posts',
  templateUrl: './feed-posts.component.html',
  styleUrls: ['./feed-posts.component.scss']
})
export class FeedPostsComponent implements OnInit {
  @Input() post;

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges() { }

}

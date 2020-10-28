import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-feed-posts',
  templateUrl: './feed-posts.component.html',
  styleUrls: ['./feed-posts.component.scss']
})
export class FeedPostsComponent implements OnInit {
  @Input() post;
  @Input() search = false;

  @Output() showPost = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges() {
    if(this.search) {
      let time = this.post.created_at;
      let date = this.post.created_at;
      this.post.time = time.substr(11, 5);
      this.post.date = date.substr(4, 6);
    }
  }

  viewPost(e) {
    const id = this.post.id_str;
    this.showPost.next(id);
  }

  viewUser(e) {
    e.stopPropagation(); // this stops view post from being called as viewPost is tied to the whole post and would also be called without it
  }

}

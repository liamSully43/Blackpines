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
      // changes the time & date into the correct format
      let time = this.post.created_at;
      let date = this.post.created_at;
      this.post.time = time.substr(11, 5);
      this.post.date = date.substr(4, 6);
      
      // replaces the shortened href with the actual href
      if(this.post.entities.urls.length > 0) {
        for(let url of this.post.entities.urls) {
          const text = this.post.full_text.replace(url.url, url.display_url);
          this.post.full_text = text;
        }
      }

      // replaces the image href with the camera emoji
      for(const prop in this.post.entities) {
        if(prop === "media") { // the media property only shows up if an image is used, unlike the url or hashtag properties
          for(let url of this.post.entities.media) {
            const text = this.post.full_text.replace(url.url, "📷");
            this.post.full_text = text;
          }
          break;
        }
      }
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

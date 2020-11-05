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
      console.log(this.post);
      this.filterPost(this.post);
      if(this.post.quoted_status) {
        this.filterPost(this.post.quoted_status);
      }
    }
  }

  // swaps the shortened urls of external links & media with the correct links & actual media
  filterPost(post) {
    // replaces the shortened href with the actual href
    if(post.entities.urls.length > 0) {
      for(let url of post.entities.urls) {
        const text = post.full_text.replace(url.url, "");
        post.full_text = text;
      }
    }

    // replaces the image href with the camera emoji
    for(const prop in post.entities) {
      if(prop === "media") { // the media property only shows up if an image is used, unlike the url or hashtag properties
        for(let url of post.extended_entities.media) {
          const text = post.full_text.replace(url.url, "📷");
          post.full_text = text;
        }
        break;
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

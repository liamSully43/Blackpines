import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-feed-posts',
  templateUrl: './feed-posts.component.html',
  styleUrls: ['./feed-posts.component.scss']
})
export class FeedPostsComponent implements OnInit {
  @Input() post;
  @Input() search = false;

  @Output() showPost = new EventEmitter<number>();
  @Output() close = new EventEmitter<string>();

  liked = false;
  error = false;
  success = false;
  links = [];
  imgUrls = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void { }

  ngOnChanges() {
    if(this.search) {
      // changes the time & date into the correct format
      let time = this.post.created_at;
      let date = this.post.created_at;
      this.post.time = time.substr(11, 5);
      this.post.date = date.substr(4, 6);
      console.log(this.post);
    }
    this.filterPost(this.post, "original");
      if(this.post.quoted_status) {
        this.filterPost(this.post.quoted_status, "quoted");
      }
  }

  // swaps the shortened urls of external links & media with the correct links & actual media
  filterPost(post, source) {
    // replaces the shortened href with the actual href
    if(post.entities.urls.length > 0) {
      for(let url of post.entities.urls) {
        const text = post.full_text.replace(url.url, "");
        post.full_text = text;
        if(source === "original" && (!post.quoted_status || url.display_url !== post.quoted_status_permalink.display)) {
          const link = {
            displayUrl: url.display_url,
            expandedUrl: url.expanded_url,
          }
          this.links.push(link);
        }
      }
    }
    
    // replaces the image href with the camera emoji
    for(const prop in post.entities) {
      if(prop === "media") { // the media property only shows up if an image is used, unlike the url or hashtag properties
        for(let url of post.extended_entities.media) {
          const text = post.full_text.replace(url.url, "");
          post.full_text = text;
          if(source === "original") this.imgUrls.push(url);
        }
        break;
      }
    }
  }

  closeTweet() {
    this.close.next();
  }

  viewPost() {
    const id = this.post.id_str;
    this.showPost.next(id);
  }

  viewUser(e) {
    e.stopPropagation(); // this stops view post from being called as viewPost is tied to the whole post and would also be called without it
  }

  loadUser(handle) {
    console.log(handle);
    // load/get user profile
  }
}

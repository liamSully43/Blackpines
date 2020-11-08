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
  @Input() user: any = {};

  @Output() showPost = new EventEmitter<number>();
  @Output() close = new EventEmitter<string>();

  liked = false;
  error = false;
  links = [];
  imgUrls = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void { }

  ngOnChanges() {
    console.log(this.post);
    // this updates the original tweet details with the retweeted tweets details for the various filter functions
    if(this.post.retweeted_status) {
      const user = this.post.user;
      const id = this.post.id_str;
      const date = this.post.created_at;
      this.post = this.post.retweeted_status;
        this.post.original_user = user;
        this.post.original_id = id;
        this.post.created_at = date;
    }

    // changes the time & date into the correct format as the time and date is sent back in different formats depending on the back-end api request
    if(this.search) {
      let time = this.post.created_at;
      let date = this.post.created_at;
      this.post.time = time.substr(11, 5);
      this.post.date = date.substr(4, 6);
    }
    else {
      let time = this.post.created_at;
      let date = this.post.created_at;
      this.post.time = time.substr(7, 5);
      this.post.date = date.substr(0, 6);
    }

    this.filterPost(this.post, "original");
    if(this.post.quoted_status) {
      this.filterPost(this.post.quoted_status, "quoted");
    }
  }

  // swaps the shortened urls of external links & media with the correct links & actual media
  filterPost(post, source) {
    // replaces shortened hrefs from the tweet text
    if(post.entities.urls.length > 0) {
      let finalLink = post.entities.urls.length;
      finalLink--;
      for(let url of post.entities.urls) {
        const text = post.full_text.replace(url.url, "");
        post.full_text = text;
        console.log(post);
        if(source === "original" && (!post.quoted_status || url.display_url !== post.entities.urls[finalLink].display_url)) { // if the tweet is a quote tweet, the final url is the link to the original tweet. post.entities.urls[finalLink].display_url = the final link
          const link = {
            displayUrl: url.display_url,
            expandedUrl: url.expanded_url,
          }
          this.links.push(link);
        }
      }
    }
    
    // replaces shortened image hrefs from the tweet text
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
    const id = (this.post.original_id) ? this.post.original_id : this.post.id_str;
    this.showPost.next(id);
  }

  viewUser(e) {
    e.stopPropagation(); // this stops view post from being called as viewPost is tied to the whole post and would also be called without it
  }

  loadUser(handle) {
    console.log(handle);
    // load/get user profile
  }

  deleteTweet(e) {
    e.stopPropagation(); // stops view post from being called
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const id = this.post.id_str;
    this.http.post("api/twitter/delete/tweet", { headers, id }).subscribe(res => {
      if(res) {
        (<HTMLElement>document.querySelector(".results")).classList.add("hide");
      }
      else {
        this.error = true;
        setTimeout(() => this.error = false, 5000);
      }
    })
  }
}

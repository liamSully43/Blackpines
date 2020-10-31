import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http'

@Component({
  selector: 'app-twitter-post',
  templateUrl: './twitter-post.component.html',
  styleUrls: ['./twitter-post.component.scss']
})
export class TwitterPostComponent implements OnInit {
  @Input() tweet;

  @Output() close = new EventEmitter<string>(); 

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    document.querySelector("body").addEventListener("keyup", event => (event.key == "Escape") ? this.closeTweet() : null); // will close a tweet if esc is pressed
  }

  ngOnChanges() {
    console.log(this.tweet);
  }

  closeTweet() {
    this.close.next("twitter");
  }
}

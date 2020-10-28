import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http'

@Component({
  selector: 'app-twitter-post',
  templateUrl: './twitter-post.component.html',
  styleUrls: ['./twitter-post.component.scss']
})
export class TwitterPostComponent implements OnInit {
  @Input() tweet;

  constructor(private http: HttpClient) { }

  ngOnInit(): void { }
}

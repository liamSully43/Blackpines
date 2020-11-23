import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  @Input() error;
  @Output() closeError = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  close() {
    this.closeError.next();
  }

}

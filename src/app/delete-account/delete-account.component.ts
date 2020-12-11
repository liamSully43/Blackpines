import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.scss']
})
export class DeleteAccountComponent implements OnInit {

  @Output() closeDelete = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  close() {
    this.closeDelete.next();
  }

}

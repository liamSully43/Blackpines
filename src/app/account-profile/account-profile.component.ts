import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss']
})
export class AccountProfileComponent implements OnInit {
  @Input() account: any = {};
  @Input() error: boolean;

  @Output() disconnectMethod = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {}

  ngOnChanges() {
    console.log(this.account);
  }

  disconnect() :void {
    const id = this.account.id_str;
    this.disconnectMethod.next(id);
  }

}

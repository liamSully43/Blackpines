import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  twitter: boolean = true;
  
  twitterError = false;

  user: any = {};

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.get("api/user", { headers }).subscribe(data => {
      this.user = data
      this.twitter = (typeof this.user.twitter !== "undefined" && this.user.twitter !== null) ? true : false;
    });
  }

  disconnect(e) {
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.get("api/twitter/account/disconnect", { headers }).subscribe((accountConnected: boolean) => {
      if(accountConnected) {
        this.twitterError = true;
      }
      this.twitter = accountConnected;
    });
  }

  passwordField() {
    const passwordForm = (<HTMLInputElement>document.querySelector(".password-form"));
      if(passwordForm.classList.contains("expandForm")) {
          passwordForm.classList.remove("expandForm");
          passwordForm.classList.add("shrinkForm");
      }
      else {
          passwordForm.classList.add("expandForm");
          passwordForm.classList.remove("shrinkForm");
      }
  }

  checkPasswords() {
    const oldPassword = (<HTMLInputElement>document.querySelector(".old-password")).value;
    const newPassword = (<HTMLInputElement>document.querySelector(".new-password")).value;
    if(oldPassword === newPassword) {
        (<HTMLInputElement>document.querySelector(".same-password")).innerHTML = "Please enter a new password";
    }
    else {
      let headers = new HttpHeaders().set("Authorization", "auth-token");
      const username = this.user.username;
      this.http.post("api/changePassword", { headers, username, oldPassword, newPassword}, {responseType: "json"}).subscribe((result: any) => {
        (<HTMLInputElement>document.querySelector(".same-password")).innerHTML = result.message;
        if(result.success) {
          (<HTMLInputElement>document.querySelector(".old-password")).value = "";
          (<HTMLInputElement>document.querySelector(".new-password")).value = "";
          setTimeout(() => {
            this.passwordField();
          }, 2000);
        }
      })

    }
  }
}
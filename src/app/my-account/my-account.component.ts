import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  twitter: boolean = true;
  
  twitterError = false;

  user: any = {};

  headers = new HttpHeaders().set("Authorization", "auth-token");

  error: boolean = false;
  errorMessage: String = "";
  maxAccounts: boolean = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if(params.error === "account already exists") {
        this.showError("This account has already been added, please try adding a different account");
      }
      else if(params.error === "max accounts") {
        this.showError("Maximum number of accounts added");
      }
      else if(params.error === "server error") {
        this.showError("An error occured, please try again later");
      }
    })
    const headers = this.headers;
    this.http.get("api/user", { headers }).subscribe(data => {
      this.user = data
      this.twitter = (this.user.twitter.length > 0) ? true : false;
      this.maxAccounts = (this.user.twitter.length >= 5) ? true : false;
      const email = this.user.username;
      if(email.length > 30) { // any email over 30 characters will need to be truncated
        this.user.username = email.subStr(0, 28); // cut at 28 characters in order to fit the '...' on the end without the email breaking onto the next line
        this.user.username += "...";
      }
    });
  }

  disconnect(id) {
    let headers = this.headers;
    this.http.post("api/twitter/account/disconnect", { headers, id }).subscribe((accountRemoved: boolean) => {
      if(!accountRemoved) {
        this.showError("Unable to remove account, please try again later");
        return
      }
      for(let [index, account] of this.user.twitter.entries()) {
        if(account.id_str == id) {
          this.user.twitter.splice(index, 1);
          break;
        }
      }
      console.log(this.user.twitter.length);
      if(this.user.twitter.length < 1) {
        this.twitter = false;
        console.log(this.twitter);
      };
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
      const headers = this.headers;
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

  showError(err) {
    this.errorMessage = err;
    console.log(this.errorMessage);
    this.error = true;
    setTimeout(() => {
      this.error = false;
      this.errorMessage = "";
    }, 5000);
  }

  closeError() {
    this.error = false;
    this.errorMessage = "";
  }
}
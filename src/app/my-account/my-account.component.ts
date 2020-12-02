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

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log(params);
    })
    this.route.url.subscribe(params => {
      console.log(params[0]);
    })
    this.route.data.subscribe(params => {
      console.log(params.success);
      if(!params.success) {
        this.showError("Account already added, please try another account");
      }
      if(params.success === null) {
        this.showError("Server error, please try again later");
      }
    });
    const headers = this.headers;
    this.http.get("api/user", { headers }).subscribe(data => {
      this.user = data
      this.twitter = (this.user.twitter.length > 0) ? true : false;
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
    this.error = true;
    setTimeout(() => !this.error, 5000);
  }
}
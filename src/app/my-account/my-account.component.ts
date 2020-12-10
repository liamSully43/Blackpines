import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  twitter: boolean = true;

  user: any = {};
  accountsConnected: number = 0;

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
      this.user = data;
      this.accountsConnected = this.user.twitter.length;
      this.twitter = (this.user.twitter.length > 0) ? true : false;
      this.maxAccounts = (this.user.twitter.length >= 5) ? true : false;
      const email = this.user.username;
      if(email.length > 25) { // any email over 25 characters will need to be truncated
        this.user.username = email.subStr(0, 22); // cut at 22 characters in order to fit the '...' on the end without the email breaking onto the next line
        this.user.username += "...";
      }
      for(let account of this.user.twitter) {
        const profilePic = account.profile_image_url_https.replace("normal", "200x200");
        account.profile_image_url_https = profilePic;
      }
    });
  }

  disconnect(val) {
    let headers = this.headers;
    const id = val.id
    const element = val.element
    this.http.post("api/twitter/account/disconnect", { headers, id }).subscribe((accountRemoved: boolean) => {
      console.log(accountRemoved);
      if(!accountRemoved) {
        this.showError("Unable to remove account, please try again later");
        return
      }
      for(let [index, account] of this.user.twitter.entries()) {
        if(account.id_str == id) {
          element.classList.add("disconnect");
          setTimeout(() => this.user.twitter.splice(index, 1), 500);
          break;
        }
      }
      if(this.user.twitter.length < 1) {
        this.twitter = false;
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
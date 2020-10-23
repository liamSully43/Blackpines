import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss']
})
export class EntryComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void { }

  // enable the signin/login button
  enableSignIn() {
    setTimeout(function() {
        let email = (<HTMLInputElement>document.querySelector(".login-email")).value.trim();
        let password = (<HTMLInputElement>document.querySelector(".login-password")).value;
        (<HTMLInputElement>document.querySelector(".login")).disabled = (email.length > 0 && password.length > 0) ? false : true;
    }, 1);
  }

  // enable the signup/register button
  enableRegister() {
    setTimeout(function() {
      let name = (<HTMLInputElement>document.querySelector(".signup-name")).value;
      let lastName = (<HTMLInputElement>document.querySelector(".signup-last-name")).value;
      let email = (<HTMLInputElement>document.querySelector(".signup-email")).value.trim();
      let password = (<HTMLInputElement>document.querySelector(".signup-password")).value;
      (<HTMLInputElement>document.querySelector(".signup")).disabled = (name.length > 0 && lastName.length > 0 && email.length > 0 && password.length > 0) ? false : true;
    })
  }

  // swap between login & signup forms
  loginSwap = e => {
    if(e.path[0].classList[1] === "sign-up-button") {
      (<HTMLInputElement>document.querySelector(".sign-up-button")).classList.remove("a");
      (<HTMLInputElement>document.querySelector(".selection")).style.animation = "right 0.2s";
      (<HTMLInputElement>document.querySelector(".selection")).style.marginLeft = "50%";
      (<HTMLInputElement>document.querySelector(".login-form")).classList.add("hide");
      (<HTMLInputElement>document.querySelector(".signup-form")).classList.remove("hide");
    }
    else {
      (<HTMLInputElement>document.querySelector(".sign-up-button")).classList.add("a");
      (<HTMLInputElement>document.querySelector(".selection")).style.animation = "left 0.2s";
      (<HTMLInputElement>document.querySelector(".selection")).style.marginLeft = "0%";
      (<HTMLInputElement>document.querySelector(".login-form")).classList.remove("hide");
      (<HTMLInputElement>document.querySelector(".signup-form")).classList.add("hide");
    }
  }

  submitLoginForm(e) {
    e.preventDefault();
    const username = (<HTMLInputElement>document.querySelector(".login-email")).value;
    const password = (<HTMLInputElement>document.querySelector(".login-password")).value;
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.post("login", { headers, username, password },  {responseType: "json"}).subscribe((data: any) => {
      if(data.success === false) {
        (<HTMLElement>document.querySelector(".login-error")).innerHTML = data.message;
      }
      else {
        (<HTMLFormElement>document.querySelector(".login-form")).submit();
      }
    });
  }

  submitRegisterForm(e) {
    e.preventDefault();
    const firstName = (<HTMLInputElement>document.querySelector(".signup-name")).value;
    const lastName = (<HTMLInputElement>document.querySelector(".signup-last-name")).value;
    const username = (<HTMLInputElement>document.querySelector(".signup-email")).value;
    const password = (<HTMLInputElement>document.querySelector(".signup-password")).value;
    let headers = new HttpHeaders().set("Authorization", "auth-token");
    this.http.post("register", { headers, firstName, lastName, username, password },  {responseType: "json"}).subscribe((data: any) => {
      if(data.success === false) {
        (<HTMLElement>document.querySelector(".register-error")).innerHTML = data.message;
      }
      else {
        (<HTMLFormElement>document.querySelector(".signup-form")).submit();
      }
    });
  }
}
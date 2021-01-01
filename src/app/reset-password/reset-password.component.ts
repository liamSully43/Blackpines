import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    ) { }

  password: string = "";
  confirmPassword: string = "";
  loading: boolean = false;
  params: any;

  message = {
    text: "",
    show: false,
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => this.params = params);
  }

  updatePassword(e) {
    this.password = e.srcElement.value;
  }

  updateConfirmPassword(e) {
    this.confirmPassword = e.srcElement.value;
  }

  submitPassword() {
    if(this.password.length < 8) {
      return this.fail("Password must be at least 8 characters long");
    }
    if(this.password !== this.confirmPassword) {
      return this.fail("Passwords must match");
    }
    this.loading = true;
    const headers = new HttpHeaders().set("Authoirzation", "auth-token");
    const password = this.password;
    const username = this.params.un;
    const timestamp = this.params.ts;
    const token = this.params.tk;
    this.http.post("/reset-password", { headers, password, username, timestamp, token }).subscribe((res : any) => {
      this.loading = false;
      if(res.success) {
        window.location.href = res.route // either /my-feed or /entry depending on if the user was able to be automatically logged in or not
      }
      else {
        this.fail(res.message);
      }
    })
  }

  fail(msg) {
    this.message.text = msg;
    this.message.show = true;
    setTimeout(() => {
      this.message.show = false;
    }, 5000);
  }

}

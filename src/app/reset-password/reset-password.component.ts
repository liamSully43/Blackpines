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
    success: false,
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
    const code = this.params.cd;
    this.http.post("/reset-password", { headers, password, username, timestamp, code }).subscribe((res: any) => {
      this.loading = false;
      if(res.success) {
        this.success();
      }
      else {
        this.fail(res.message);
      }
    })
  }

  success() {
    this.message.text = "Password updated";
    this.message.success = true;
    this.message.show = true;
    setTimeout(() => {
      this.message.show = false;
    }, 5000);
  }

  fail(msg) {
    this.message.text = msg;
    this.message.success = false;
    this.message.show = true;
    setTimeout(() => {
      this.message.show = false;
    }, 5000);
  }

}

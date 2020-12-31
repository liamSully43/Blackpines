import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  constructor(private http: HttpClient) { }

  message = {
    text: "",
    success: true,
    show: false,
  }

  email: string = "";
  loading: boolean = false;

  ngOnInit(): void {
  }

  setEmail(e) {
    setTimeout(() => {
      this.email = e.srcElement.value;
    }, 1)
  }

  resetPassword() {
    this.message.show = false;
    this.loading = true;
    const headers = new HttpHeaders().set("Authorization", "auth-token");
    const email = this.email;
    this.http.post("/forgot-password", { headers, email }).subscribe((res: any) => {
      this.loading = false;
      this.message.success = res;
      this.message.text = (res) ? "A reset password email has been sent, please check your inbox." : "Something went wrong, please try again later";
      this.message.show = true;
      setTimeout(() => {
        this.message.show = false;
      }, 10000);
    })
  }

}

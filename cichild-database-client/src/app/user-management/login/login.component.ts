import {Component, OnInit} from '@angular/core';
import {UserService} from "../user.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    loginData = {
        username: '',
        password: ''
    }

    constructor(private userService:UserService) {
    }

    ngOnInit(): void {
    }

    onLoginClick() {
        this.userService.login(this.loginData);
    }

}

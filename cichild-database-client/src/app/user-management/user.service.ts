import {Injectable, Injector} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {HttpService} from "../http.service";
import {FishService} from "../fish.service";
import {CookieService} from 'ngx-cookie-service';
import {GlobalService} from "../global.service";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    user: any;
    userDataKeys = {
        username: 'username',
        id: 'id',
        isLogged: 'isLogged',
        isAdmin: 'isAdmin'
    };
    private subscription: Subscription = new Subscription;

    constructor(private injector: Injector,
                private cookieService: CookieService) {
        this.clearUser();
    }

    login(loginData: any) {
        let httpService = this.injector.get<HttpService>(HttpService);
        this.subscription = httpService.userLogin(loginData).subscribe((response) => {
            if (response.success) {
                this.user = response.user
                this.setUserData(this.user);
                let globalService = this.injector.get<GlobalService>(GlobalService);
                globalService.selectedViewMode = globalService.viewModes.tanks;
            } else {
                alert('Your username or password is wrong. Please try again.');
            }
        });
    }

    logout() {
        this.clearUser();
        this.cookieService.set(this.userDataKeys.username, '');
        this.cookieService.set(this.userDataKeys.id, '');
        this.cookieService.set(this.userDataKeys.isLogged, 'false');
    }

    initUser() {
        this.user = {
            id: this.cookieService.get(this.userDataKeys.id),
            username: this.cookieService.get(this.userDataKeys.username),
        }
    }

    clearUser() {
        this.user = {
            username: '',
            id: -1
        };
    }

    isUserAuthenticated() {
        return this.cookieService.get(this.userDataKeys.isLogged) === 'true';
    }

    setUserData(userData: any) {
        this.user = userData;
        this.cookieService.set(this.userDataKeys.username, userData.username);
        this.cookieService.set(this.userDataKeys.id, userData.id);
        this.cookieService.set(this.userDataKeys.isLogged, 'true');
        this.cookieService.set(this.userDataKeys.isAdmin, userData.is_admin);
    }
}

import {Injectable} from '@angular/core';
import {HttpService} from "../http.service";
import {Subscription} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ActionsLogService {

    actionsLog: [] = [];
    // @ts-ignore
    private subscription: Subscription;

    constructor(private httpService: HttpService) {
    }

    loadActionsLog() {
        this.subscription = this.httpService.loadActionsLog()
            .subscribe(response => {
                    this.actionsLog = response.actionsLog;
                },
                error => {
                    alert('Something went wrong!');
                });
    }
}

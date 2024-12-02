import {AfterViewInit, Component, DoCheck, ElementRef, OnInit, ViewChild} from '@angular/core';
import {GlobalService} from "../../global.service";
import {LayoutService} from "../layout.service";
import {UserService} from "../../user-management/user.service";
import {ActionsLogService} from "../../actions-log/actions-log.service";
import {HttpService} from "../../http.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit, DoCheck {

    // @ts-ignore
    @ViewChild('viewModeSwitch') viewModeSwitch: ElementRef;

    constructor(private globalService: GlobalService,
                private userService: UserService,
                private http:HttpService,
                private actionsLogService: ActionsLogService,
                private layoutService: LayoutService) {
    }

    isLoginMode = false;
    username = '';
    csvSeparator = ','
    newNameCharacter = ""

    // @ts-ignore
    private subscription: Subscription;

    ngOnInit(): void {
    }

    ngDoCheck() {
        this.isLoginMode = this.globalService.selectedViewMode === this.globalService.viewModes.login
        if (!this.isLoginMode) {
            if (this.viewModeSwitch) {
                this.layoutService.viewModeSwitch = this.viewModeSwitch.nativeElement;
            }
            this.username = this.userService.user.username;
        }

    }

    ngAfterViewInit() {
        // this.layoutService.viewModeSwitch = this.viewModeSwitch.nativeElement;
    }

    changeViewMode() {
        if (this.globalService.selectedViewMode === this.globalService.viewModes.tanks) {
            this.globalService.selectedViewMode = this.globalService.viewModes.database;
        } else {
            this.globalService.selectedViewMode = this.globalService.viewModes.tanks;
        }
    }

    logout() {
        this.userService.logout();
    }

    downloadFreeNames() {
        this.globalService.downloadFreeNames();
    }

    loadActionsLog() {
        this.actionsLogService.loadActionsLog();
    }

    exportClutches(){
        this.subscription = this.http.exportClutches(this.csvSeparator)
            .subscribe(response => {

                    // @ts-ignore
                    if (response.success) {
                        // @ts-ignore
                        this.globalService.downloadFile(response.filePath, response.fileName);
                    } else {
                        alert('Something went wrong!');
                    }
                },
                error => {
                    alert('Something went wrong!');
                });
    }

    createNewNameChar(){
        if (this.newNameCharacter === ''){
            alert('You must type in a character. Blank is not supported.');
            return;
        }
        this.subscription = this.http.createNewNameChar(this.newNameCharacter)
            .subscribe(response => {

                    // @ts-ignore
                    if (response.success) {
                        alert('Your new character was saved successfully and new names were generated.')
                        // @ts-ignore
                        this.globalService.cichildData.freeFishNames = response.free_fish_name;
                    } else {
                        alert('You already have "'+this.newNameCharacter + '" in the characters list.'+ '\n'+
                            ' Please choose another character and try again');
                    }
                    this.newNameCharacter = '';
                },
                error => {
                    alert('Something went wrong!');
                });
    }
}

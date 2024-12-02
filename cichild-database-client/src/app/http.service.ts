/* tslint:disable */
import {Injectable, Injector} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import {Component, OnDestroy, OnInit, Output} from '@angular/core';
import {Observable, Subject, Subscription} from "rxjs";
import {NgxSpinnerService, Spinner} from "ngx-spinner";
import {FishService} from "./fish.service";
import {UserService} from "./user-management/user.service";

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    constructor(private http: HttpClient,
                private userService: UserService,
                private injector: Injector) {
    }

    private urlLoadData = environment.apiURL + 'load_data';
    private urlLoadActionsLog = environment.apiURL + 'load_actions_log';
    private urlCreateNewFish = environment.apiURL + 'create_new_fish';
    private urlCreateNewClutch = environment.apiURL + 'create_new_clutch';
    private urlUpdateFish = environment.apiURL + 'update_fish';
    private urlUpdateClutch = environment.apiURL + 'update_clutch';
    private urlDeleteClutch = environment.apiURL + 'delete_clutch';
    private urlDeleteFish = environment.apiURL + 'delete_fish';
    private urlSaveNewComment = environment.apiURL + 'save_new_comment';
    private urlUpdateComment = environment.apiURL + 'update_comment';
    private urlDeleteComment = environment.apiURL + 'delete_comment';
    private urlSplitTankFragment = environment.apiURL + 'split_tank_fragment';
    private urlMergeTankFragments = environment.apiURL + 'merge_tank_fragments';
    private urlMoveFish = environment.apiURL + 'move_fish';
    private urlChangeFragmentSpecie = environment.apiURL + 'change_fragment_specie';
    private urlUserLogin = environment.apiURL + 'user_login';
    private urlDownloadFreeNames = environment.apiURL + 'download_free_names';
    private urlExportClutches = environment.apiURL + 'export_clutches';
    private urlCreateNewNameChar = environment.apiURL + 'create_new_name_character';

    getCichildData(): Observable<any> {
        return this.http.post(`${this.urlLoadData}/`, {});
    }

    loadActionsLog(): Observable<any> {
        return this.http.post(`${this.urlLoadActionsLog}/`, {});
    }

    updateFish(fish: any): Observable<any> {
        let userService = this.injector.get<UserService>(UserService);
        return this.http.post(`${this.urlUpdateFish}/`, {
            fishID: fish.id,
            fishNameID: fish.name.id,
            fragmentID: fish.location.id,
            isDead: fish.is_dead,
            isMissing: fish.is_missing,
            gender: fish.gender,
            transgene: fish.transgene,
            date: fish.date,
            dof: fish.dof,
            usage: fish.usage,
            userID: userService.user.id

        });
    }

    updateClutch(clutch: any): Observable<any> {
        console.log(clutch);
        let userService = this.injector.get<UserService>(UserService);
        return this.http.post(`${this.urlUpdateClutch}/`, {
            clutchID: clutch.id,
            isDead: clutch.is_dead,
            dof: clutch.dof.toString(),
            usage: clutch.usage,
            switchToFatherDate:clutch.switch_to_father_date.toString(),
            switchToFatherSize:clutch.switch_to_father_size,
            includeInCSV:clutch.include_in_csv,
            deathDate:clutch.death_date.toString(),
            userID: userService.user.id
        });
    }

    createNewFish(fish: any): Observable<any> {
        let userService = this.injector.get<UserService>(UserService);
        return this.http.post(`${this.urlCreateNewFish}/`, {
            fishNameID: fish.name.id,
            fragmentID: fish.location.id,
            isDead: fish.is_dead,
            isMissing: fish.is_missing,
            gender: fish.gender,
            transgene: fish.transgene,
            date: fish.date,
            dof: fish.dof.toString(),
            usage: fish.usage,
            userID: userService.user.id
        });
    }

    createNewClutch(clutch: any): Observable<any> {
        let userService = this.injector.get<UserService>(UserService);
        return this.http.post(`${this.urlCreateNewClutch}/`, {
            maleID: clutch.male.id,
            femaleID: clutch.female.id,
            isDead: clutch.isDead,
            usage: clutch.usage,
            dof: clutch.dof.toString(),
            switchToFatherDate:clutch.switchToFatherDate,
            switchToFatherSize:clutch.switchToFatherSize,
            includeInCSV:clutch.includeInCSV,
            deathDate:clutch.deathDate,
            userID: userService.user.id,
        });
    }

    saveNewComment(commentItemID: number, commentItemType: string, comment: string): Observable<any> {
        let userService = this.injector.get<UserService>(UserService);
        return this.http.post(`${this.urlSaveNewComment}/`, {
            commentItemID: commentItemID,
            commentItemType: commentItemType,
            comment: comment,
            userID: userService.user.id
        });
    }

    updateComment(commentID: number, comment: string): Observable<any> {
        let userService = this.injector.get<UserService>(UserService);
        return this.http.post(`${this.urlUpdateComment}/`, {
            commentID: commentID,
            comment: comment,
            userID: userService.user.id
        });
    }

    deleteComment(commentID: number): Observable<any> {
        let userService = this.injector.get<UserService>(UserService);
        return this.http.post(`${this.urlDeleteComment}/`, {
            commentID: commentID,
            userID: userService.user.id
        });
    }

    deleteClutch(clutchID: number): Observable<any> {
        let userService = this.injector.get<UserService>(UserService);
        return this.http.post(`${this.urlDeleteClutch}/`, {
            clutchID: clutchID,
            userID: userService.user.id
        });
    }

    deleteFish(fishID: number): Observable<any> {
        let userService = this.injector.get<UserService>(UserService);
        return this.http.post(`${this.urlDeleteFish}/`, {
            fishID: fishID,
            userID: userService.user.id
        });
    }

    splitTankFragment(tankFragmentID: number, splitOptionID: number): Observable<any> {
        return this.http.post(`${this.urlSplitTankFragment}/`, {
            tankFragmentID: tankFragmentID,
            splitOptionID: splitOptionID,
            userID: this.userService.user.id
        });
    }

    mergeTankFragment(tankFragment_1_ID: number, tankFragment_2_ID: number): Observable<any> {
        return this.http.post(`${this.urlMergeTankFragments}/`, {
            tankFragment_1_ID: tankFragment_1_ID,
            tankFragment_2_ID: tankFragment_2_ID,
            userID: this.userService.user.id
        });
    }

    moveFish(fishID: number, destinationFragmentID: number): Observable<any> {
        let userService = this.injector.get<UserService>(UserService);
        return this.http.post(`${this.urlMoveFish}/`, {
            fishID: fishID,
            destinationFragmentID: destinationFragmentID,
            userID: userService.user.id,
        });
    }

    changeFragmentSpecie(fragmentID: number, specieID: number): Observable<any> {
        let userService = this.injector.get<UserService>(UserService);
        return this.http.post(`${this.urlChangeFragmentSpecie}/`, {
            fragmentID: fragmentID,
            specieID: specieID,
            userID: userService.user.id,
        });
    }

    userLogin(loginData: any): Observable<any> {
        return this.http.post(`${this.urlUserLogin}/`, {
            loginData: loginData
        });
    }

    downloadFreeNames(): Observable<any> {
        return this.http.post(`${this.urlDownloadFreeNames}/`, {});
    }

    exportClutches(csvSeparator: string) {
        return this.http.post(`${this.urlExportClutches}/`, {
            csvSeparator: csvSeparator
        });
    }

    createNewNameChar(newChar: string) {
        return this.http.post(`${this.urlCreateNewNameChar}/`, {
            newChar: newChar
        });
    }

    downloadFile(filePath:string, fileName:string) {
        const a = document.createElement('a');
        a.href = environment.mediaURL + filePath;
        a.target = '_blank';
        a.download = fileName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // URL.revokeObjectURL(filePath);
    }


}

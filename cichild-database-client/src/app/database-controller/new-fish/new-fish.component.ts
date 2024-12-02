import {Component, DoCheck, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {FishService} from "../../fish.service";
import {GlobalService} from "../../global.service";
import {HttpService} from "../../http.service";

@Component({
    selector: 'app-new-fish',
    templateUrl: './new-fish.component.html',
    styleUrls: ['./new-fish.component.css']
})
export class NewFishComponent implements OnInit, DoCheck {

    newFish: any;
    nameOptions: any[] = [];
    genderOptions: string[] = ['male', 'female', 'unknown'];
    locationOptions: any[] = [];

    // @ts-ignore
    private subscription: Subscription;

    constructor(private fishService: FishService,
                private globalService: GlobalService,
                private httpService: HttpService) {
    }

    ngOnInit(): void {
    }

    ngDoCheck() {

        this.newFish = this.fishService.newFish;
        this.nameOptions = this.globalService.cichildData.freeFishNames;

        // @ts-ignore
        this.locationOptions = this.globalService.cichildData.activeFragments;
    }

    save() {
        this.subscription = this.httpService.createNewFish(this.newFish)
            .subscribe(response => {
                    if (response.success) {
                        this.globalService.addNewFish(response.fish, response.tank_fragment);
                        this.fishService.resetNewFish();
                        this.globalService.cichildData.freeFishNames = response.free_fish_name;
                    } else {
                        alert('Another fish has the same name.' + '\n' +
                            'Please choose another name!' + '\n' +
                            'Sorry for showing a used name in this list!');
                    }
                    alert(response.message);

                },
                error => {
                    alert('Something went wrong!');
                });
    }

}

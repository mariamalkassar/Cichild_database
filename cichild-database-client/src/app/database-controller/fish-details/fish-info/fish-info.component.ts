import {Component, DoCheck, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {FishService} from "../../../fish.service";
import {GlobalService} from "../../../global.service";
import {HttpService} from "../../../http.service";

@Component({
    selector: 'app-fish-info',
    templateUrl: './fish-info.component.html',
    styleUrls: ['./fish-info.component.css']
})
export class FishInfoComponent implements OnInit, DoCheck {

    selectedFish: any;

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
        this.selectedFish = this.fishService.selectedFish;
        this.nameOptions = [];
        this.nameOptions.push(...this.globalService.cichildData.freeFishNames);
        this.nameOptions.splice(0, 1, this.selectedFish.name);

        // @ts-ignore
        this.locationOptions = this.globalService.cichildData.activeFragments;
    }


    updateFishData() {
        this.subscription = this.httpService.updateFish(this.selectedFish)
            .subscribe(response => {
                    if (response.success) {
                        for (let i = 0; i < this.globalService.cichildData.activeFragments.length; i++) {
                            let location = this.globalService.cichildData.activeFragments[i];
                            // @ts-ignore
                            if (response.fish.location_id === location.id) {
                                this.selectedFish.location = location;
                            }
                        }

                        this.globalService.cichildData.freeFishNames = response.free_fish_names;
                        this.globalService.updateTankFragmentFish(response.old_tank_fragment);
                        this.globalService.updateTankFragmentFish(response.new_tank_fragment);
                    } else {
                        this.selectedFish.is_dead = true;
                    }
                    alert(response.message);

                },
                error => {
                    alert('Something went wrong!');
                });
    }

}

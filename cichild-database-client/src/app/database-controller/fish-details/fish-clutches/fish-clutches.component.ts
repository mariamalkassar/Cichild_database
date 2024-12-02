import {Component, DoCheck, OnInit} from '@angular/core';
import {FishService} from "../../../fish.service";
import {GlobalService} from "../../../global.service";
import {Subscription} from "rxjs";
import {HttpService} from "../../../http.service";

@Component({
    selector: 'app-fish-clutches',
    templateUrl: './fish-clutches.component.html',
    styleUrls: ['./fish-clutches.component.css']
})
export class FishClutchesComponent implements OnInit, DoCheck {
    selectedFish: any;

    // @ts-ignore
    private subscription: Subscription;

    constructor(private fishService: FishService,
                private globalService:GlobalService,
                private httpService: HttpService) {
    }

    ngOnInit(): void {
    }

    ngDoCheck(): void {
        this.selectedFish = this.fishService.selectedFish;
    }

    getClutch(clutchID:number){
        // @ts-ignore
        return this.globalService.cichildData.clutches[clutchID];
    }

    selectClutch(clutch: any) {
        console.log(clutch)
        this.fishService.selectClutch(clutch);
    }

    selectFish(fish: any) {
        this.fishService.selectFish(fish);
    }

    delete(clutch: any) {
        if (confirm('Are you sure you want to delete this clutch?')) {
            this.subscription = this.httpService.deleteClutch(clutch.id)
                .subscribe(response => {
                        if (response.success) {
                            let clutchIndexInMale = clutch.male.clutches_ids.indexOf(clutch.id);
                            clutch.male.clutches_ids.splice(clutchIndexInMale, 1);

                            let clutchIndexInFemale = clutch.female.clutches_ids.indexOf(clutch.id);
                            clutch.female.clutches_ids.splice(clutchIndexInFemale, 1);

                            alert('Your clutch has been deleted successfully');
                        } else {
                            alert('Something went wrong!');
                        }
                    },
                    error => {
                        alert('Something went wrong!');
                    });
        }
    }

    onNewClutchClick() {
        if (this.selectedFish.gender === 'male') {
            this.fishService.newClutch.male = this.selectedFish;
        }
        else if (this.selectedFish.gender === 'female') {
            this.fishService.newClutch.female = this.selectedFish;
        }

    }
}

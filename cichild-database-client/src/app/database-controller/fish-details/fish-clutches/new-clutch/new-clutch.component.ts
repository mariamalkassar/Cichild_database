import {Component, DoCheck, OnInit} from '@angular/core';
import {FishService} from "../../../../fish.service";
import {Subscription} from "rxjs";
import {HttpService} from "../../../../http.service";
import {GlobalService} from "../../../../global.service";

@Component({
    selector: 'app-new-clutch',
    templateUrl: './new-clutch.component.html',
    styleUrls: ['./new-clutch.component.css']
})
export class NewClutchComponent implements OnInit, DoCheck {

    newClutch: any;
    malesOption: any[] = [];
    femalesOption: any[] = [];

    // @ts-ignore
    private subscription: Subscription;

    constructor(private fishService: FishService,
                private globalService:GlobalService,
                private httpService: HttpService) {
    }

    ngOnInit(): void {
    }

    ngDoCheck() {
        this.newClutch = this.fishService.newClutch;
        this.malesOption = this.fishService.maleOptions;
        this.femalesOption = this.fishService.femaleOptions;
    }

    save() {

        if(!this.newClutch.male){
            alert('Please choose the male before saving.');
            return;
        }
        if(!this.newClutch.female){
            alert('Please choose the female before saving.');
            return;
        }
        this.subscription = this.httpService.createNewClutch(this.newClutch)
            .subscribe(response => {
                    if (response.success) {
                        // @ts-ignore
                        response.clutch.male = this.globalService.cichildData.fish[response.clutch.male_id];
                        // @ts-ignore
                        response.clutch.female = this.globalService.cichildData.fish[response.clutch.female_id];

                        response.clutch.male.clutches_ids.push(response.clutch.id);
                        response.clutch.female.clutches_ids.push(response.clutch.id);

                        // @ts-ignore
                        this.globalService.cichildData.clutches[response.clutch.id] = response.clutch;

                        // this.fishService.selectedFish.clutches.push(response.clutch);
                        this.fishService.resetNewClutch();
                        alert('Your clutch has been saved successfully');
                    } else {
                        alert(response.message);
                    }
                },
                error => {
                    alert('Something went wrong!');
                });
    }
}

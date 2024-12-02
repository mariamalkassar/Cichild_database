import {Component, DoCheck, Input, OnInit} from '@angular/core';
import {FishService} from "../../../../fish.service";
import {GlobalService} from "../../../../global.service";
import {Subscription} from "rxjs";
import {HttpService} from "../../../../http.service";

@Component({
    selector: 'app-selected-clutch',
    templateUrl: './selected-clutch.component.html',
    styleUrls: ['./selected-clutch.component.css']
})
export class SelectedClutchComponent implements OnInit, DoCheck {

    selectedClutch: any;
    // @ts-ignore
    private subscription: Subscription;

    constructor(private fishService: FishService,
                private globalService: GlobalService,
                private httpService: HttpService) {
    }

    ngOnInit(): void {
    }

    ngDoCheck() {
        this.selectedClutch = this.fishService.selectedClutch;
    }

    selectFish(fish: any) {
        this.fishService.selectFish(fish);
    }
    updateClutchData() {
        this.subscription = this.httpService.updateClutch(this.selectedClutch)
            .subscribe(response => {
                    if (response.success) {
                        alert(response.message);
                    } else {
                        alert('Something went wrong!');
                    }
                },
                error => {
                    alert('Something went wrong!');
                });
    }
}

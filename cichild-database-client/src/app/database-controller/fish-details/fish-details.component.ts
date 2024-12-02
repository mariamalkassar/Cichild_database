import {Component, DoCheck, Input, OnInit} from '@angular/core';
import {FishService} from "../../fish.service";
import {GlobalService} from "../../global.service";
import {Subscription} from "rxjs";
import {HttpService} from "../../http.service";

@Component({
    selector: 'app-fish-details',
    templateUrl: './fish-details.component.html',
    styleUrls: ['./fish-details.component.css']
})
export class FishDetailsComponent implements OnInit, DoCheck {
    selectedFish: any;

    constructor(private fishService: FishService) {
    }

    ngOnInit(): void {
    }

    ngDoCheck() {
        this.selectedFish = this.fishService.selectedFish;
    }

}

/* tslint:disable */
import {Component, DoCheck, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FishService} from "../../../../../fish.service";
import {GlobalService} from "../../../../../global.service";
import {Subscription} from "rxjs";
import {HttpService} from "../../../../../http.service";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
    selector: 'app-tank-fish',
    templateUrl: './tank-fish.component.html',
    styleUrls: ['./tank-fish.component.css']
})
export class TankFishComponent implements OnInit, DoCheck {
    @Input() fish: any;
    @Input() fragmentHTMLColumnsCount: any;
    // @ts-ignore
    @ViewChild('fishDropDown') fishDropDown: ElementRef;
    // @ts-ignore
    private subscription: Subscription;

    constructor(private fishService: FishService,
                private httpService: HttpService,
                private globalService: GlobalService,
                private spinner: NgxSpinnerService) {
    }

    ngOnInit(): void {

    }

    ngDoCheck() {
        if (this.fragmentHTMLColumnsCount > 6) {
            this.fish.HTMLColumnsCount = 1;
        } else {
            this.fish.HTMLColumnsCount = 12 / this.fragmentHTMLColumnsCount;
        }
    }

    onFishClick() {
        if (this.globalService.selectedFunctionMode == this.globalService.functionModes.modes.fishDetails) {
            this.fishService.selectFish(this.fish);
        } else {
            this.moveFish();
        }
    }

    moveFish() {
        if (this.fish.is_dead) {
            alert('This fish is dead. It can not be moved until you flag it as alive.');
            return false;
        }

        // @ts-ignore
        this.subscription = this.httpService.moveFish(this.fish.id, this.globalService.functionModes.destinationFragment.id)
            .subscribe(response => {
                    // @ts-ignore
                    this.globalService.cichildData.fish[response.fish.id].location_history = response.fish.location_history;
                    this.globalService.updateFishLocation(response.fish);
                    this.globalService.updateTankFragmentFish(response.old_tank_fragment);
                    this.globalService.updateTankFragmentFish(response.new_tank_fragment);
                },
                error => {
                    alert('Something went wrong!');
                });
        return true;
    }

}

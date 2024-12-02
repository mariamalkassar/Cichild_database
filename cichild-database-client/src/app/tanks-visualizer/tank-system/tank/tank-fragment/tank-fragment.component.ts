import {AfterViewInit, Component, DoCheck, Input, OnInit} from '@angular/core';
import {GlobalService} from "../../../../global.service";
import {Subscription} from "rxjs";
import {HttpService} from "../../../../http.service";
import {FishService} from "../../../../fish.service";

@Component({
    selector: 'app-tank-fragment',
    templateUrl: './tank-fragment.component.html',
    styleUrls: ['./tank-fragment.component.css']
})
export class TankFragmentComponent implements OnInit, DoCheck {
    @Input() fragment: any;
    // @Input() maxSlotsNumber: any;
    specie: any;
    splitMergeSelectedOption: any = null;
    species: any[] = [];

    // @ts-ignore
    private subscription: Subscription;

    constructor(private globalService: GlobalService,
                private fishService: FishService,
                private httpService: HttpService) {
    }

    ngOnInit(): void {
        for (const [specieID, specie] of Object.entries(this.globalService.cichildData.species)) {
            this.species.push(specie);
        }
        this.refresh();
    }

    ngDoCheck() {
        this.refresh();
    }

    refresh() {

        // @ts-ignore
        this.specie = this.globalService.cichildData.species[this.fragment.specie_id];

        this.splitMergeSelectedOption = this.fragment.name;

        this.globalService.updatedFishData.subscribe(x => this.updateFishData());
    }

    updateFishData() {
        this.fragment.fish = [];
        for (let i = 0; i < this.fragment.fish_ids.length; i++) {
            let fishID = this.fragment.fish_ids[i];

            if (fishID in this.globalService.cichildData.fish) {
                // @ts-ignore
                this.fragment.fish.push(this.globalService.cichildData.fish[fishID]);
            }
        }
    }

    onSpecieChange() {
        this.subscription = this.httpService.changeFragmentSpecie(this.fragment.id, this.fragment.specie_id)
            .subscribe(response => {
                    if (response.success) {

                        // @ts-ignore
                        this.specie = this.globalService.cichildData.species[this.fragment.specie_id];
                    } else {
                        alert('Something went wrong!');
                    }
                },
                error => {
                    alert('Something went wrong!');
                });

    }

    splitFragment() {
        // @ts-ignore
        this.subscription = this.httpService.splitTankFragment(this.fragment.id, this.splitMergeSelectedOption.id)
            .subscribe(response => {
                    this.globalService.loadCichildData();
                },
                error => {
                    alert('Something went wrong!');
                });
    }

    mergeFragments() {
        // @ts-ignore
        this.subscription = this.httpService.mergeTankFragment(this.splitMergeSelectedOption.fragment_1_id, this.splitMergeSelectedOption.fragment_2_id)
            .subscribe(response => {
                    this.globalService.loadCichildData();
                },
                error => {
                    alert('Something went wrong!');
                });
    }

    onSplitMergeChange() {
        // @ts-ignore
        if (this.splitMergeSelectedOption.type === 'split') {
            this.splitFragment();
        } else if (this.splitMergeSelectedOption.type === 'merge') {
            this.mergeFragments();
        }
    }

    setNewFishLocation(location: any) {
        this.fishService.resetNewFish();
        this.fishService.setNewFishLocation(location);
    }

    onIsDestinationChange() {
        if (this.fragment.isDestination) {
            this.globalService.selectDestinationFragment(this.fragment);
        } else {
            this.globalService.deselectDestinationFragment();
        }
    }
}

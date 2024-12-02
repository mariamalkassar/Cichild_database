import {Component, Input, OnInit} from '@angular/core';
import {GlobalService} from "../../../global.service";
import {FishService} from "../../../fish.service";
import {Subscription} from "rxjs";
import {HttpService} from "../../../http.service";

@Component({
    selector: 'app-fish-list-item',
    templateUrl: './fish-list-item.component.html',
    styleUrls: ['./fish-list-item.component.css']
})
export class FishListItemComponent implements OnInit {
    @Input() fish: any;

    // @ts-ignore
    private subscription: Subscription;

    constructor(private httpService: HttpService,
                private fishService: FishService,
                private globalService: GlobalService) {
    }

    ngOnInit(): void {
    }

    selectFish() {
        this.fishService.selectFish(this.fish);
    }


    delete(fish: any) {
        if (confirm('Are you sure you want to delete this fish (' + this.fish.name.name + '(' + this.fish.generation.toString() + ')' + ')?')) {
            this.subscription = this.httpService.deleteFish(fish.id)
                .subscribe(response => {
                        if (response.success) {

                            if(this.fishService.selectedFish === fish){
                                this.fishService.selectedFish = null;
                            }
                            this.globalService.deleteFish(fish.id, response.affected_parents_clutches, response.free_fish_names);
                            alert('Your fish has been deleted successfully');
                        } else {
                            alert('Something went wrong!');
                        }
                    },
                    error => {
                        alert('Something went wrong!');
                    });
        }
    }
}

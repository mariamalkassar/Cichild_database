import {Component, DoCheck, OnInit} from '@angular/core';
import {FishService} from "../../fish.service";
import {DatabaseControllerService} from "../database-controller.service";

@Component({
    selector: 'app-fish-list',
    templateUrl: './fish-list.component.html',
    styleUrls: ['./fish-list.component.css']
})
export class FishListComponent implements OnInit, DoCheck {

    fishList: any[] = [];
    filteredFishList: any[] = [];
    filteredClutchesListIDs: any[] = [];
    selectedFish: any;
    fishListFilters = {
        query: '',
        isAlive: false,
        isDead: false,
        gender: {
            isMale: false,
            isFemale: false,
            isUnknown: false
        },
        parenting: {
            parents: false,
            non_parents: false
        }
    }


    constructor(private fishService: FishService,
                private databaseControllerService:DatabaseControllerService) {
    }

    ngOnInit(): void {
    }

    ngDoCheck() {
        this.fishList = this.fishService.fishList;
        this.selectedFish = this.fishService.selectedFish;
        this.fishListFilters.query = this.databaseControllerService.globalSearchQuery;
        this.filterFishList();
    }

    getSubQueries(query: string, separator: string, expressionSymbol: string) {
        let subQueries = [];
        let currentSubQuery = '';

        let isExpressionSymbolEncountered = false;
        for (let i = 0; i < query.length; i++) {

            if (query[i] === expressionSymbol) {
                if (!isExpressionSymbolEncountered) {
                    if (currentSubQuery !== '') {
                        subQueries.push(currentSubQuery);
                    }
                    currentSubQuery = '';
                    isExpressionSymbolEncountered = true;
                } else {
                    subQueries.push(currentSubQuery);
                    currentSubQuery = '';
                    isExpressionSymbolEncountered = false;
                }
            } else {
                if (isExpressionSymbolEncountered) {
                    currentSubQuery += query[i];
                } else {
                    if (query[i] === separator) {
                        if (currentSubQuery !== '') {
                            subQueries.push(currentSubQuery);
                        }
                        currentSubQuery = '';
                    } else {
                        currentSubQuery += query[i];
                    }
                }
            }
        }

        if (currentSubQuery !== '') {
            subQueries.push(currentSubQuery);
        }
        return subQueries;
    }

    filterFishListAccordingToQuery(subQueries: string[], fish: any) {

        let add = true;
        for (let i = 0; i < subQueries.length; i++) {
            let q = subQueries[i].toLowerCase();
            let fishLocationName = '';
            if (fish.location) {
                fishLocationName = fish.location.name.toLowerCase();
            }

            if (fish.name.name.toLowerCase().includes(q)) {
                continue;
            }
            if (fish.usage.toLowerCase().includes(q)) {
                continue;
            }
            if (fishLocationName.toLowerCase().includes(q)) {
                continue;
            }
            if (fish.date.toLowerCase().includes(q)) {
                continue;
            }
            if (fish.dof.toLowerCase().includes(q)) {
                continue;
            }
            if (fish.usage.toLowerCase().includes(q)) {
                continue;
            }
            if (fish.transgene.toLowerCase().includes(q)) {
                continue;
            }
            if (fish.user.toLowerCase().includes(q)) {
                continue;
            }

            let foundInComments = false;
            for (let j = 0; j < fish.comments.length; j++) {
                if (fish.comments[j].comment.toLowerCase().includes(q)) {
                    foundInComments = true;
                    break;
                }
            }
            if (foundInComments) {
                continue;
            }
            add = false;
            break;
        }

        return add;
    }

    addClutchesAccordingToQuery(subQueries: string[], clutches_ids: any[]) {
        for (let i = 0; i < clutches_ids.length; i++) {
            let clutch = this.fishService.getClutch(clutches_ids[i]);
            if (this.filteredClutchesListIDs.indexOf(clutch.id) === -1) {
                let add = true;
                let male = this.fishService.getFish(clutch.male_id);
                let female = this.fishService.getFish(clutch.female_id);
                for (let j = 0; j < subQueries.length; j++) {
                    let q = subQueries[j].toLowerCase();
                    if (male.name.name.toLowerCase().includes(q)) {
                        continue;
                    }
                    if (female.name.name.toLowerCase().includes(q)) {
                        continue;
                    }
                    if (clutch.usage.toLowerCase().includes(q)) {
                        continue;
                    }
                    if (clutch.dof.toLowerCase().includes(q)) {
                        continue;
                    }
                    if (clutch.usage.toLowerCase().includes(q)) {
                        continue;
                    }
                    if (clutch.user.toLowerCase().includes(q)) {
                        continue;
                    }

                    let foundInComments = false;
                    for (let k = 0; k < clutch.comments.length; k++) {
                        if (clutch.comments[k].comment.toLowerCase().includes(q)) {
                            foundInComments = true;
                            break;
                        }
                    }
                    if (foundInComments) {
                        continue;
                    }
                    add = false;
                    break;
                }

                if (add) {
                    this.filteredClutchesListIDs.push(clutch.id);
                }
            }
        }
    }

    filterFishList() {
        this.filteredFishList = [];
        this.filteredClutchesListIDs = [];
        let subQueries = this.getSubQueries(this.fishListFilters.query, ' ', '"');
        for (let i = 0; i < this.fishList.length; i++) {
            let fish = this.fishList[i];

            if (this.filterFishListAccordingToQuery(subQueries, fish)) {
                if (this.fishListFilters.parenting.parents) {
                    if (fish.clutches_ids.length === 0) {
                        continue;
                    }
                }
                if (this.fishListFilters.parenting.non_parents) {
                    if (fish.clutches_ids.length > 0) {
                        continue;
                    }
                }
                if (this.fishListFilters.isAlive) {
                    if (fish.is_dead) {
                        continue;
                    }
                }
                if (this.fishListFilters.isDead) {
                    if (fish.is_dead === false) {
                        continue;
                    }
                }
                if (this.fishListFilters.gender.isMale) {
                    if (fish.gender !== 'male') {
                        continue;
                    }
                }
                if (this.fishListFilters.gender.isFemale) {
                    if (fish.gender !== 'female') {
                        continue;
                    }
                }
                if (this.fishListFilters.gender.isUnknown) {
                    if (fish.gender !== 'unknown') {
                        continue;
                    }
                }

                this.filteredFishList.push(fish);
            }

            this.addClutchesAccordingToQuery(subQueries, fish.clutches_ids);
        }
    }
}

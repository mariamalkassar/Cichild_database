import {Component, DoCheck, OnInit} from '@angular/core';
import {FishService} from "../../fish.service";
import {DatabaseControllerService} from "../database-controller.service";

@Component({
    selector: 'app-clutches-list',
    templateUrl: './clutches-list.component.html',
    styleUrls: ['./clutches-list.component.css']
})
export class ClutchesListComponent implements OnInit, DoCheck {

    clutchesList: any[] = [];
    filteredClutchesList: any[] = [];
    searchQuery = '';

    constructor(private fishService: FishService,
                private databaseControllerService: DatabaseControllerService) {
    }

    ngOnInit(): void {
    }

    ngDoCheck() {
        this.clutchesList = this.fishService.clutchesList;
        this.searchQuery = this.databaseControllerService.globalSearchQuery;
        this.filterClutchesList();
    }

    selectClutch(clutch: any) {
        this.fishService.selectClutch(clutch);
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

    getFish(fishID: number) {
        return this.fishService.getFish(fishID);
    }

    filterClutchesList() {
        this.filteredClutchesList = [];

        let subQueries = this.getSubQueries(this.searchQuery, ' ', '"');
        for (let i = 0; i < this.clutchesList.length; i++) {
            let clutch = this.clutchesList[i];

            let add = true;
            let male = this.fishService.getFish(clutch.male_id);
            let female = this.fishService.getFish(clutch.female_id);
            clutch.male = male;
            clutch.female = female;
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
                this.filteredClutchesList.push(clutch);
            }
        }
    }
}

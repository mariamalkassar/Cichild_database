import {Component, DoCheck, OnInit} from '@angular/core';
import {ActionsLogService} from "./actions-log.service";
import {filter} from "rxjs/operators";

@Component({
    selector: 'app-actions-log',
    templateUrl: './actions-log.component.html',
    styleUrls: ['./actions-log.component.css']
})
export class ActionsLogComponent implements OnInit, DoCheck {

    actionsLog: [] = [];
    filteredLog: [] = [];
    filters = {
        query: '',
        actionType: {
            create: false,
            delete: false,
            move: false,
            rename: false,
            update: false,
            retrieve: false,
            kill: false,
            split: false,
            merge: false,
            missing: false,
            changeSpecie: false,
        },
        itemType: {
            fish: false,
            clutch: false,
            tank: false
        },
    }

    constructor(private actionsLogService: ActionsLogService) {
    }

    ngOnInit(): void {
    }

    ngDoCheck() {
        this.actionsLog = this.actionsLogService.actionsLog;
        this.filter();
    }

    filter() {
        this.filteredLog = [];
        let result1 = this.filterAccordingToActionType(this.actionsLog);
        let result2 = this.filterAccordingToActionItemType(result1);
        let result3 = this.filterAccordingToQuery(result2);
        this.filteredLog.push(...result3);
    }

    filterAccordingToActionType(actionsLog: []) {
        let result: [] = [];
        for (let i = 0; i < actionsLog.length; i++) {
            let action = actionsLog[i];
            if (!this.filters.actionType.create &&
                !this.filters.actionType.delete &&
                !this.filters.actionType.update &&
                !this.filters.actionType.move &&
                !this.filters.actionType.rename &&
                !this.filters.actionType.kill &&
                !this.filters.actionType.retrieve &&
                !this.filters.actionType.split &&
                !this.filters.actionType.merge &&
                !this.filters.actionType.missing &&
                !this.filters.actionType.changeSpecie) {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.actionType.create && action.actionType === 'CREATE') {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.actionType.delete && action.actionType === 'DELETE') {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.actionType.update && action.actionType === 'UPDATE') {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.actionType.rename && action.actionType === 'RENAME') {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.actionType.move && action.actionType === 'MOVE') {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.actionType.kill && action.actionType === 'KILL') {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.actionType.retrieve && action.actionType === 'RETRIEVE') {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.actionType.split && action.actionType === 'SPLIT') {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.actionType.merge && action.actionType === 'MERGE') {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.actionType.missing && action.actionType === 'FLAG AS MISSING') {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.actionType.changeSpecie && action.actionType === 'CHANGE SPECIE') {
                result.push(action);
            }
        }

        return result;
    }

    filterAccordingToActionItemType(actionsLog: []) {
        let result: [] = [];
        for (let i = 0; i < actionsLog.length; i++) {

            let action = actionsLog[i];
            if (!this.filters.itemType.fish &&
                !this.filters.itemType.clutch &&
                !this.filters.itemType.tank) {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.itemType.fish && action.itemType === 'FISH') {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.itemType.clutch && action.itemType === 'CLUTCH') {
                result.push(action);
                continue;
            }
            // @ts-ignore
            if (this.filters.itemType.tank && action.itemType === 'TANK') {
                result.push(action);
            }
        }

        return result;
    }

    getSubQueries() {
        return this.filters.query.split(' ');
    }

    filterAccordingToQuery(actionsLog: []) {
        let result: [] = [];

        let queries = this.getSubQueries();

        for (let i = 0; i < actionsLog.length; i++) {
            let action = actionsLog[i];
            let add = true;
            for (let j = 0; j < queries.length; j++) {
                let query = queries[j];

                // @ts-ignore
                if (!action.description.toLowerCase().includes(query.toLowerCase()) &&
                    // @ts-ignore
                    !action.date.toLowerCase().includes(query.toLowerCase()) &&
                    // @ts-ignore
                    !action.itemName.toLowerCase().includes(query.toLowerCase()) &&
                    // @ts-ignore
                    !action.user.toLowerCase().includes(query.toLowerCase())) {
                    add = false;
                    break;
                }
            }

            if (add) {
                result.push(action);
            }
        }

        return result;
    }
}

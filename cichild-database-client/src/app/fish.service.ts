import {Injectable, OnInit} from '@angular/core';
import {GlobalService} from "./global.service";
import {LayoutService} from "./layout/layout.service";
import {DatabaseControllerService} from "./database-controller/database-controller.service";

@Injectable({
    providedIn: 'root'
})
export class FishService {

    fishList: any[] = [];
    clutchesList: any[] = [];
    selectedFish: any;
    newFish: any;
    selectedClutch: any;

    //region

    newClutch: any;
    maleOptions: any[] = [];
    femaleOptions: any[] = [];

    //endregion

    constructor(private globalService: GlobalService,
                private layoutService: LayoutService,
                private dbControllerService: DatabaseControllerService) {
        this.resetNewFish();
        this.resetNewClutch();
    }

    selectFish(selectedFish: any) {
        this.selectedFish = selectedFish;
        this.initNewClutch(this.selectedFish);

        for (let i = 0; i < this.selectedFish.clutches_ids.length; i++) {
            let clutch = this.getClutch(this.selectedFish.clutches_ids[i]);

            // @ts-ignore
            clutch.male = this.globalService.cichildData.fish[clutch.male_id];
            // @ts-ignore
            clutch.female = this.globalService.cichildData.fish[clutch.female_id];
        }

        if (this.globalService.selectedViewMode === this.globalService.viewModes.tanks) {
            // @ts-ignore
            this.layoutService.viewModeSwitch.click();
        }

        this.dbControllerService.selectedViewMode = this.dbControllerService.viewModes.fishDetails;
    }

    selectClutch(selectedClutch: any) {
        this.selectedClutch = selectedClutch;
    }

    setNewFishLocation(location: any) {
        this.newFish.location = location;
    }

    resetNewFish() {
        this.newFish = {
            name: this.globalService.cichildData.freeFishNames[0],
            gender: null,
            location: null,
            transgene: '',
            date: '',
            usage: '',
            dof: '',
            is_dead: false,
            is_missing: false,
        }
    }

    resetNewClutch() {
        this.newClutch = {
            male: null,
            female: null,
            dof: '',
            isDead: false,
            usage: '',
            includeInCSV:true,
            deathDate:'',
            switchToFatherDate:'',
            switchToFatherSize:0

        }
    }

    initNewClutch(parent: any) {
        if (parent.gender === 'male') {
            this.newClutch.male = parent;
            this.newClutch.female = null;
            this.maleOptions = [parent];
            this.femaleOptions = this.globalService.getFishOfGender('female');
        } else if (parent.gender === 'female') {
            this.newClutch.female = parent;
            this.newClutch.male = null;
            this.femaleOptions = [parent];
            this.maleOptions = this.globalService.getFishOfGender('male');
        }
    }

    loadFishList() {
        this.fishList = [];
        for (const [fishID, fish] of Object.entries(this.globalService.cichildData.fish)) {
            this.fishList.push(fish);
        }

        this.clutchesList = [];
        for (const [ID, clutch] of Object.entries(this.globalService.cichildData.clutches)) {
            this.clutchesList.push(clutch);
        }
    }

    getFish(fishID: number) {
        // @ts-ignore
        return this.globalService.cichildData.fish[fishID];
    }

    getClutch(clutchID: number) {
        // @ts-ignore
        return this.globalService.cichildData.clutches[clutchID];
    }
}


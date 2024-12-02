/* tslint:disable */
import {Injectable, Injector, OnInit} from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";
import {HttpService} from "./http.service";
import {FishService} from "./fish.service";
import {BehaviorSubject, Subscription} from "rxjs";
import {UserService} from "./user-management/user.service";
import {environment} from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GlobalService {

    viewModes = {
        tanks: 'Tanks',
        database: 'Database',
        login: 'login'
    }

    functionModes = {
        modes: {
            move: 'Move',
            fishDetails: 'FishDetails'
        },
        destinationFragment: null
    }
    selectedViewMode: string = '';
    selectedFunctionMode: string = '';

    cichildData = {
        fish: {},
        tanksSystems: [],
        tanks: {},
        tanksFragments: {},
        activeFragments: [],
        species: {},
        clutches: {},
        freeFishNames: []
    }
    isDataLoaded: boolean = false;

    public updatedFishData = new BehaviorSubject<boolean>(false);

    private subscription: Subscription = new Subscription;

    constructor(private spinner: NgxSpinnerService,
                private httpService: HttpService,
                private userService: UserService,
                private injector: Injector) {

        this.selectedFunctionMode = this.functionModes.modes.fishDetails;

        if (this.userService.isUserAuthenticated()) {
            this.selectedViewMode = this.viewModes.tanks;
            this.userService.initUser();
        } else {
            this.selectedViewMode = this.viewModes.login;
        }
        this.loadCichildData();
    }


    loadCichildData() {
        this.spinner.show();
        this.subscription = this.httpService.getCichildData().subscribe((response) => {
            this.cichildData.fish = response.data.fish;
            this.cichildData.freeFishNames = response.data.free_fish_name;
            this.cichildData.species = response.data.species;
            this.cichildData.tanksSystems = response.data.tanks_systems;
            this.cichildData.tanks = response.data.tanks;
            this.cichildData.tanksFragments = response.data.tanks_fragments;
            this.cichildData.clutches = response.data.clutches;
            this.isDataLoaded = true;
            this.initData();
            this.updateFishService();
        });
    }

    deleteFish(fishID: number, affectedParentsClutches: {}, freeFishNames: []) {
        for (const [parentID, clutches] of Object.entries(affectedParentsClutches)) {
            // @ts-ignore
            this.cichildData.fish[parentID].clutches = clutches;
        }

        this.cichildData.freeFishNames = freeFishNames;

        // @ts-ignore
        delete this.cichildData.fish[fishID];
        this.initActiveFragmentsData();

        this.updateFishService();
    }

    updateFishService() {
        let fishService = this.injector.get<FishService>(FishService);
        fishService.loadFishList();
    }

    initData() {
        this.initFishData();
        this.initActiveFragmentsData();
        this.initTanksLayout();
    }

    initFishData() {
        for (const [fishID, fish] of Object.entries(this.cichildData.fish)) {
            // @ts-ignore
            if (fish.tank_fragment_id) {
                // @ts-ignore
                fish.location = this.cichildData.tanksFragments[fish.tank_fragment_id];
            } else {
                // @ts-ignore
                fish.location = null;
            }
        }
    }

    addNewFish(fishData: any, location: any) {
        if (fishData.tank_fragment_id) {
            // @ts-ignore
            fishData.location = this.cichildData.tanksFragments[fishData.tank_fragment_id];
        } else {
            // @ts-ignore
            fishData.location = null;
        }
        // @ts-ignore
        this.cichildData.fish[fishData.id] = fishData;
        this.updateTankFragmentFish(location);
        let fishService = this.injector.get<FishService>(FishService);
        fishService.loadFishList();
    }

    initActiveFragmentsData() {
        // @ts-ignore
        this.cichildData.activeFragments = [];

        for (const [fragmentID, fragment] of Object.entries(this.cichildData.tanksFragments)) {
            // @ts-ignore
            if (fragment.is_active) {
                if (this.functionModes.destinationFragment) {
                    // @ts-ignore
                    fragment.isDestination = fragment.id === this.functionModes.destinationFragment.id;
                    // @ts-ignore
                    if (fragment.isDestination) {
                        // @ts-ignore
                        this.functionModes.destinationFragment = fragment;
                    }
                } else {
                    // @ts-ignore
                    fragment.isDestination = false;
                }

                // @ts-ignore
                fragment.fish = [];
                // @ts-ignore
                for (let i = 0; i < fragment.fish_ids.length; i++) {
                    // @ts-ignore
                    let fishID = fragment.fish_ids[i];
                    if (fishID in this.cichildData.fish) {
                        // @ts-ignore
                        fragment.fish.push(this.cichildData.fish[fishID]);
                    }
                }

                // @ts-ignore
                this.cichildData.activeFragments.push(fragment);
            }
        }
        // @ts-ignore
        this.cichildData.activeFragments.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
        this.updatedFishData.next(true);
    }

    initTanksLayout() {
        for (let i = 0; i < this.cichildData.tanksSystems.length; i++) {
            let tankSystem = this.cichildData.tanksSystems[i];
            // @ts-ignore
            for (let j = 0; j < tankSystem.tanks_ids.length; j++) {
                // @ts-ignore
                let tank = this.cichildData.tanks[tankSystem.tanks_ids[j]];
                let slotHTMLColumns = 12 / tank.slots_num;
                for (let k = 0; k < tank.fragments_ids.length; k++) {
                    // @ts-ignore
                    let fragment = this.cichildData.tanksFragments[tank.fragments_ids[k]];
                    let fragmentSlotsCount = fragment.end - fragment.start + 1;
                    fragment.HTMLColumnsCount = slotHTMLColumns * fragmentSlotsCount;
                }
            }
        }
    }

    selectDestinationFragment(newDestinationFragment: any) {
        this.deselectDestinationFragment();

        this.functionModes.destinationFragment = newDestinationFragment;
        this.selectedFunctionMode = this.functionModes.modes.move;
    }

    deselectDestinationFragment() {
        if (this.functionModes.destinationFragment) {
            // @ts-ignore
            this.functionModes.destinationFragment.isDestination = false;
            this.functionModes.destinationFragment = null;
            this.selectedFunctionMode = this.functionModes.modes.fishDetails;
        }
    }

    getTankSystemByID(systemID: number) {
        for (let i = 0; i < this.cichildData.tanksSystems.length; i++) {
            // @ts-ignore
            if (this.cichildData.tanksSystems[i].id === systemID) {
                return this.cichildData.tanksSystems[i];
            }
        }
        return null;
    }

    updateTankFragmentFish(updatedTankFragmentData: any) {
        // @ts-ignore
        let fragment = this.cichildData.tanksFragments[updatedTankFragmentData.id];
        // @ts-ignore
        fragment.fish_ids = updatedTankFragmentData.fish_ids;
        fragment.fish = [];
        for (let i = 0; i < fragment.fish_ids.length; i++) {
            // @ts-ignore
            fragment.fish.push(this.cichildData.fish[fragment.fish_ids[i]]);
        }
    }

    updateFishLocation(newFishData: any) {
        // @ts-ignore
        let fish = this.cichildData.fish[newFishData.id];

        if (newFishData.location_id) {
            for (let i = 0; i < this.cichildData.activeFragments.length; i++) {
                let location = this.cichildData.activeFragments[i];
                // @ts-ignore
                if (newFishData.location_id === location.id) {
                    fish.location = location;
                }
            }
        } else {
            // @ts-ignore
            fish.location = null;
        }
    }

    getFishOfGender(gender: string) {
        let fishes = [];
        for (const [fishID, fish] of Object.entries(this.cichildData.fish)) {
            // @ts-ignore
            if (fish.gender === gender) {
                fishes.push(fish);
            }
        }
        return fishes;
    }

    downloadFile(filePath: string, fileName: string) {
        const a = document.createElement('a');
        a.href = environment.mediaURL + filePath;

        a.target = '_blank';
        a.download = fileName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    downloadFreeNames() {
        this.subscription = this.httpService.downloadFreeNames()
            .subscribe(result => {
                    // this.downloadFile(result.filePath, result.fileName);

                    const a = document.createElement('a');
                    a.href = 'http://18.185.138.69:80/media/Free_fish_names.txt';
                    a.target = '_blank';
                    a.download = 'Free_fish_names.txt';

                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                },
                error => {
                    console.log(error);
                });
    }
}

/* tslint:disable */

import {GlobalService} from "./global.service";

export class FishName {
    id: number;
    name: string;
    inUse: boolean;

    constructor(backendData: any) {
        this.id = backendData.id;
        this.name = backendData.name;
        this.inUse = backendData.in_use;
    }
}

export class User {
    id: number;
    username: string;


    constructor(backendData: any) {
        this.id = backendData.id;
        this.username = backendData.username;
    }
}

export class Comment {
    id: number;
    comment: string;
    date: string;
    user: any;

    constructor(backendData: any) {
        this.id = backendData.id;
        this.comment = backendData.comment;
        this.date = backendData.date;
        this.user = null;
    }
}

export class Specie {
    id: number;
    name: string;
    backgroundColor: string;
    writingColor: string;

    constructor(backendData: any) {
        this.id = backendData.id;
        this.name = backendData.name;
        this.backgroundColor = backendData.background_color;
        this.writingColor = backendData.writing_color;
    }
}

export class SplittingOption {
    id: number;
    type: string;
    fragment1: {
        name: string,
        numbers: number[]
    }
    fragment2: {
        name: string,
        numbers: number[]
    }

    constructor(backendData: any) {
        this.id = backendData.id;
        this.type = backendData.type;
        this.fragment1 = backendData.fragment_1;
        this.fragment2 = backendData.fragment_2;
    }


}

export class MergingOption {
    id: number;
    type: string;
    name: string;
    fragment1ID: number;
    fragment2ID: number;

    constructor(backendData: any) {
        this.id = backendData.id;
        this.type = backendData.type;
        this.name = backendData.name;
        this.fragment1ID = backendData.fragment_1_id;
        this.fragment2ID = backendData.fragment_2_id;
    }
}

export class Fish {
    id: number;
    name: FishName;
    isDead: boolean;
    isMissing: boolean;
    gender: string;
    date: string;
    dof: string;
    transgene: string;
    location:TankFragment;

    constructor(backendData: any, location:TankFragment) {
        this.id = backendData.id;
        this.name = new FishName(backendData.name);
        this.isDead = backendData.is_dead;
        this.isMissing = backendData.is_missing;
        this.isMissing = backendData.is_missing;
        this.gender = backendData.gender;
        this.date = backendData.date;
        this.dof = backendData.dof;
        this.transgene = backendData.transgene;
        this.location = location;
    }
}

export class TankFragment {
    id: number;
    name: string;
    // comments: Comment[];
    isActive: boolean;
    // specie: Specie;
    // splittingOptions: SplittingOption[];
    // mergingOptions: MergingOption[];
    // fish: Fish[];

    constructor(backendData: any, globalService: GlobalService) {
        this.id = backendData.id;
        this.name = backendData.name;
        this.isActive = backendData.is_active;
        //this.specie = globalService.cichildData.species[backendData.specie_id];

    }
}

export class Tank {
    id: number;
    name: string;
    // comments: Comment[];

    constructor(backendData: any) {
        this.id = backendData.id;
        this.name = backendData.name;
    }
}

export class TankSystem {
    id: number;
    name: string;
    color: string;
    // tanks: Tank[];

    constructor(backendData: any) {
        this.id = backendData.id;
        this.name = backendData.name;
        this.color = backendData.color;
        // this.tanksIDs = backendData.tanks_ids;
    }
}

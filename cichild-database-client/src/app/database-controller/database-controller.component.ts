import {Component, DoCheck, OnInit} from '@angular/core';
import {FishService} from "../fish.service";
import {DatabaseControllerService} from "./database-controller.service";
import {Fish} from "../models";

@Component({
  selector: 'app-database-controller',
  templateUrl: './database-controller.component.html',
  styleUrls: ['./database-controller.component.css']
})
export class DatabaseControllerComponent implements OnInit, DoCheck {

  selectedViewMode:number=2;
  selectedFish:any;
  viewModes:any;

  globalSearchQuery = '';
  constructor(private databaseControllerService:DatabaseControllerService,
              private fishService:FishService) {
  }

  ngOnInit(): void {
    this.viewModes = this.databaseControllerService.viewModes;
  }

  ngDoCheck() {
    this.selectedFish = this.fishService.selectedFish;
    this.selectedViewMode = this.databaseControllerService.selectedViewMode;
    this.databaseControllerService.globalSearchQuery = this.globalSearchQuery;
  }
}

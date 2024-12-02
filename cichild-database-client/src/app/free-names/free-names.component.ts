import {Component, DoCheck, OnInit} from '@angular/core';
import {GlobalService} from "../global.service";

@Component({
  selector: 'app-free-names',
  templateUrl: './free-names.component.html',
  styleUrls: ['./free-names.component.css']
})
export class FreeNamesComponent implements OnInit, DoCheck {
  freeNames:any[] = [];
  constructor(private globalService:GlobalService) { }

  ngOnInit(): void {
  }

  ngDoCheck() {
    // @ts-ignore
    this.freeNames = this.globalService.cichildData.freeFishNames;
  }

}

import {Component, DoCheck, OnInit} from '@angular/core';
import {GlobalService} from "../../global.service";

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit, DoCheck {

  selectedViewMode: string = '';
  viewModes: any;

  constructor(private globalService: GlobalService) {
  }

  ngOnInit(): void {
    this.viewModes = this.globalService.viewModes;
  }

  ngDoCheck() {
    this.selectedViewMode = this.globalService.selectedViewMode;
  }
}

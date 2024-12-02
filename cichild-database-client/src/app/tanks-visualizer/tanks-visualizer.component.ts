/* tslint:disable */
import {Component, DoCheck, ElementRef, OnInit, ViewChild} from '@angular/core';
import {GlobalService} from "../global.service";

@Component({
  selector: 'app-tanks-visualizer',
  templateUrl: './tanks-visualizer.component.html',
  styleUrls: ['./tanks-visualizer.component.css']
})
export class TanksVisualizerComponent implements OnInit, DoCheck {

  // @ts-ignore
  @ViewChild('mainBody') mainBody: ElementRef;

  tanksSystems: any[] = [];
  selectedSystemIndex: number = 0;

  constructor(private globalService: GlobalService) {
  }

  ngOnInit(): void {
  }

  ngDoCheck() {
    if (this.tanksSystems.length === 0) {
      this.tanksSystems = this.globalService.cichildData.tanksSystems;
    }
  }

  onSelectedSystemChange(selectedSystem: any) {
    for (let i = 0; i < this.tanksSystems.length; i++) {
      if (this.tanksSystems[i] === selectedSystem) {
        this.selectedSystemIndex = i;
      }
    }
  }
}

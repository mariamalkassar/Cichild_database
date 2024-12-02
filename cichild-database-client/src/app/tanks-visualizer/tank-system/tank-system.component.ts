import {Component, Input, OnInit} from '@angular/core';
import {GlobalService} from "../../global.service";

@Component({
  selector: 'app-tank-system',
  templateUrl: './tank-system.component.html',
  styleUrls: ['./tank-system.component.css']
})
export class TankSystemComponent implements OnInit {
  @Input() system:any;
  constructor(private globalService:GlobalService) { }

  ngOnInit(): void {
  }

  getTank(tankID:number){
    // @ts-ignore
    return this.globalService.cichildData.tanks[tankID];
  }

}

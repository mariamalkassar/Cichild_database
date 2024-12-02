import {Component, Input, OnInit} from '@angular/core';
import {GlobalService} from "../../../global.service";

@Component({
  selector: 'app-tank',
  templateUrl: './tank.component.html',
  styleUrls: ['./tank.component.css']
})
export class TankComponent implements OnInit {
  @Input() tank: any;
  slotHTMLColumns: number = 0;
  tankSystemColor:string='';
  constructor(private globalService:GlobalService) {
  }

  ngOnInit(): void {
    // this.slotHTMLColumns = 12 / this.tank.slots_num;
    //
    // @ts-ignore
    this.tankSystemColor = this.globalService.getTankSystemByID(this.tank.system_id).color;
    // for (let i = 0; i < this.tank.fragments_ids.length; i++) {
    //   // @ts-ignore
    //   let fragment = this.globalService.cichildData.tanksFragments[this.tank.fragments_ids[i]];
    //   let fragmentSlotsCount = fragment.end-fragment.start+1;
    //   fragment.HTMLColumnsCount = this.slotHTMLColumns*fragmentSlotsCount;
    // }
  }

  getTankFragment(fragmentID:number){
    // @ts-ignore
    return this.globalService.cichildData.tanksFragments[fragmentID];
  }

}

import {Injectable} from '@angular/core';
import {GlobalService} from "./global.service";

@Injectable({
  providedIn: 'root'
})
export class TankFragmentsService {

  constructor(private globalService: GlobalService) {
  }

  getSplittingOptions(tankFragment: any) {

  }

}

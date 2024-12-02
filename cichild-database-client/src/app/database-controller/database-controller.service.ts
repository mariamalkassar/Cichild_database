import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatabaseControllerService {

  viewModes = {
    fishDetails: 1,
    newFish: 2
  }
  selectedViewMode: number;

  globalSearchQuery = '';

  constructor() {
    this.selectedViewMode = this.viewModes.newFish;
  }
}

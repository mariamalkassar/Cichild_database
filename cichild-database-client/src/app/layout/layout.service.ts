import {ElementRef, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // @ts-ignore
  viewModeSwitch: ElementRef;

  constructor() {
  }
}

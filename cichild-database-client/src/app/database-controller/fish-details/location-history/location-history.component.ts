import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-location-history',
  templateUrl: './location-history.component.html',
  styleUrls: ['./location-history.component.css']
})
export class LocationHistoryComponent implements OnInit {

  @Input() locationHistory:any;
  constructor() { }

  ngOnInit(): void {
  }

}

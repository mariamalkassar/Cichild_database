import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-tank-fragment-comments',
    templateUrl: './tank-fragment-comments.component.html',
    styleUrls: ['./tank-fragment-comments.component.css']
})
export class TankFragmentCommentsComponent implements OnInit {
    @Input() fragment: any;

    constructor() {
    }

    ngOnInit(): void {
    }

}

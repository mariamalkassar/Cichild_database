import {Component, Input, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {HttpService} from "../http.service";

@Component({
    selector: 'app-comments-list',
    templateUrl: './comments-list.component.html',
    styleUrls: ['./comments-list.component.css']
})
export class CommentsListComponent implements OnInit {

    @Input() comments: any[] = [];
    @Input() itemType: string = '';
    @Input() itemID: number = -1;
    newComment = '';


    // @ts-ignore
    private subscription: Subscription;

    constructor(private httpService: HttpService) {
    }

    ngOnInit(): void {
    }

    updateComment(comment: any) {
        this.subscription = this.httpService.updateComment(comment.id, comment.comment)
            .subscribe(response => {
                    if (response.success) {
                        alert('Your comment has been updated successfully');
                    } else {
                        alert('Something went wrong!');
                    }

                },
                error => {
                    alert('Something went wrong!');
                });
    }

    deleteComment(comment: any) {
        if (confirm('Are you sure you want to delete this comment?')) {
            this.subscription = this.httpService.deleteComment(comment.id)
                .subscribe(response => {
                        if (response.success) {
                            // @ts-ignore
                            let commentIndex = this.comments.indexOf(comment);
                            this.comments.splice(commentIndex, 1);
                            alert('Your comment has been deleted successfully');
                        } else {
                            alert('Something went wrong!');
                        }
                    },
                    error => {
                        alert('Something went wrong!');
                    });
        }
    }

    saveNewComment() {
        this.subscription = this.httpService.saveNewComment(this.itemID, this.itemType, this.newComment)
            .subscribe(response => {

                    if (response.success) {
                        this.comments.push(response.new_comment);
                        this.newComment = '';
                    } else {
                        alert('Something went wrong!');
                    }
                },
                error => {
                    alert('Something went wrong!');
                });
    }
}

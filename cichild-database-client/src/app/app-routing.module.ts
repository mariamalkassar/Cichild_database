/* tslint:disable */
import {NgModule} from '@angular/core';
import {ExtraOptions, RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AppComponent} from "./app.component";

const routerOptions: ExtraOptions = {
    useHash: false,
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    // scrollOffset: [0, 64],
};
const routes: Routes = [
    // {path: 'downloads', component: DownloadsLoaderComponent},
    // {path: 'index', component: AppComponent},
    // {path: '', redirectTo: 'index', pathMatch: 'full'},

];

@NgModule({
    imports: [CommonModule, RouterModule.forRoot(routes, routerOptions)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}

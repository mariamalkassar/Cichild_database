/* tslint:disable */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {AppRoutingModule} from "./app-routing.module";
import {HttpClientModule} from "@angular/common/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NgxSpinnerModule} from "ngx-spinner";
import { TankComponent } from './tanks-visualizer/tank-system/tank/tank.component';
import { TankFragmentComponent } from './tanks-visualizer/tank-system/tank/tank-fragment/tank-fragment.component';
import { TanksVisualizerComponent } from './tanks-visualizer/tanks-visualizer.component';
import { TankSystemComponent } from './tanks-visualizer/tank-system/tank-system.component';
import { TankFishComponent } from './tanks-visualizer/tank-system/tank/tank-fragment/tank-fish/tank-fish.component';
import { HeaderComponent } from './layout/header/header.component';
import { LayoutComponent } from './layout/layout.component';
import { ContentComponent } from './layout/content/content.component';
import { DatabaseControllerComponent } from './database-controller/database-controller.component';
import { FishListComponent } from './database-controller/fish-list/fish-list.component';
import { FishListItemComponent } from './database-controller/fish-list/fish-list-item/fish-list-item.component';
import { FishDetailsComponent } from './database-controller/fish-details/fish-details.component';
import { NewFishComponent } from './database-controller/new-fish/new-fish.component';
import { FishInfoComponent } from './database-controller/fish-details/fish-info/fish-info.component';
import { FishClutchesComponent } from './database-controller/fish-details/fish-clutches/fish-clutches.component';
import { NewClutchComponent } from './database-controller/fish-details/fish-clutches/new-clutch/new-clutch.component';
import { LoginComponent } from './user-management/login/login.component';
import { CommentsListComponent } from './comments-list/comments-list.component';
import { TankFragmentCommentsComponent } from './tanks-visualizer/tank-system/tank/tank-fragment/tank-fragment-comments/tank-fragment-comments.component';
import { SelectedClutchComponent } from './database-controller/fish-details/fish-clutches/selected-clutch/selected-clutch.component';
import { LocationHistoryComponent } from './database-controller/fish-details/location-history/location-history.component';
import { ActionsLogComponent } from './actions-log/actions-log.component';
import { ActionComponent } from './actions-log/action/action.component';
import { FreeNamesComponent } from './free-names/free-names.component';
import { ClutchesListComponent } from './database-controller/clutches-list/clutches-list.component';

@NgModule({
  declarations: [
    AppComponent,
    TankComponent,
    TankFragmentComponent,
    TanksVisualizerComponent,
    TankSystemComponent,
    TankFishComponent,
    HeaderComponent,
    LayoutComponent,
    ContentComponent,
    DatabaseControllerComponent,
    FishListComponent,
    FishListItemComponent,
    FishDetailsComponent,
    NewFishComponent,
    FishInfoComponent,
    FishClutchesComponent,
    NewClutchComponent,
    LoginComponent,
    CommentsListComponent,
    TankFragmentCommentsComponent,
    SelectedClutchComponent,
    LocationHistoryComponent,
    ActionsLogComponent,
    ActionComponent,
    FreeNamesComponent,
    ClutchesListComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    // DashboardLayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

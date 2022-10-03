/*********************************************************** 
* Copyright (C) 2022 
* Worktez 
* 
* This program is free software; you can redistribute it and/or 
* modify it under the terms of the MIT License 
* 
* 
* This program is distributed in the hope that it will be useful, 
* but WITHOUT ANY WARRANTY; without even the implied warranty of 
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
* See the MIT License for more details. 
***********************************************************/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { element } from 'protractor';
import { Organizations } from 'src/app/Interface/OrganizationInterface';
import { Team } from 'src/app/Interface/TeamInterface';
import { MemberData } from 'src/app/Interface/UserInterface';
import { ApplicationSettingsService } from 'src/app/services/applicationSettings/application-settings.service';
import { AuthService } from 'src/app/services/auth.service';
import { BackendService } from 'src/app/services/backend/backend.service';
import { NavbarHandlerService } from 'src/app/services/navbar-handler/navbar-handler.service';
import { PopupHandlerService } from 'src/app/services/popup-handler/popup-handler.service';
import { RBAService } from 'src/app/services/RBA/rba.service';
import { StartServiceService } from 'src/app/services/start/start-service.service';
import { SubscriptionService } from 'src/app/services/subscription/subscription.service';

@Component({
  selector: 'app-view-organization-details',
  templateUrl: './view-organization-details.component.html',
  styleUrls: ['./view-organization-details.component.css']
})
export class ViewOrganizationDetailsComponent implements OnInit {

  organization: Organizations;
  teams: Team[] = [];
  members: MemberData[];
  membersReady: boolean = false;
  showLoader: boolean = true;
  showTeamsDetails: boolean = true;
  showOrgDocuments: boolean = false;
  showMemberRoles: boolean = false;
  sameUser: boolean = true;
  editProfilePicEnabled: boolean = false;
  isAdmin:boolean = false;

  constructor(public startService: StartServiceService, public rbaService: RBAService, public backendService: BackendService, public authService: AuthService, public applicationSettingsService: ApplicationSettingsService, public router: Router, public navbarHandler: NavbarHandlerService, public popupHandlerService: PopupHandlerService, public cookieService: CookieService,  public subscriptionService: SubscriptionService) { }

  ngOnInit(): void {
    this.navbarHandler.resetNavbar();
    this.navbarHandler.addToNavbar("ORGANIZATION DETAILS");
    if(this.startService.showTeams) {
      this.getOrganizationDetails();
    } else {
      this.startService.userDataStateObservable.subscribe((data) => {
        if(data){
          this.getOrganizationDetails();
        }
      });
    }
  }

  getOrganizationDetails() {
    const appKey =  this.cookieService.get("userSelectedOrgAppKey");
    this.backendService.getOrgDetails(appKey);
    this.showLoader = true;
    this.teams = [];
    this.backendService.organizationsData.subscribe(data => {
      this.organization = data;
      this.getOrgMembers(data.OrganizationDomain);
      this.organization.TeamsId.forEach(teamId => {
        this.getTeamDetails(teamId);
      });
      this.showLoader = false;
    });
  }

  upgrade(){
    this.router.navigate(['/CurrentPlan']);
  }

  getTeamDetails(teamId: string) {
    this.applicationSettingsService.getTeamDetails(teamId).subscribe(data => {
      this.teams.push(data);
    });
    this.sameUser = true;
  }

  getOrgMembers(orgDomain: string){
    this.rbaService.getAllOrgMembers(orgDomain).subscribe({
      next: (data) => {
        this.members = data
      },
      error: (error) => {
        console.error(error)
      },
      complete: () => {
        this.membersReady = true;
        this.checkAdmin();
        console.log("Completed fetching members list")
      }
    });   
  }

  checkAdmin(){
    const email = this.authService.userAppSetting.email;
    this.members.forEach((element)=>{
      if(element.Email == email){
        if(element.IsAdmin == true){
          this.isAdmin = true;
        }
      }
    })
  }

  createTeam() {
    this.router.navigate(['/CreateNewTeam']);
  }

  updatedDetails(data) {
    if(data) {
      this.getOrganizationDetails();
    }
  }

  editProfilePic() {
    this.editProfilePicEnabled = true;
  }

  switchView(data: any){
    this.showTeamsDetails = false;
    this.showOrgDocuments = false;
    this.showMemberRoles = false

    if(data == "showTeamsDetails") {
      this.showTeamsDetails = true;
    } else if(data == "showOrgDocuments"){
      this.showOrgDocuments = true;
    }
    else{
      this.showMemberRoles = true
    }
  }
  
  filterPage(){
    this.router.navigate(['/FilterPage']);
  }

}
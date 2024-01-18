import { Component, OnInit } from '@angular/core';
import { Member } from 'src/app/_models/member';
import { Pagination } from 'src/app/_models/pagination';
import { UsersParams } from 'src/app/_models/usersParams';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit{
  // members$: Observable<Member[]> | undefined;
  members: Member[] = [];
  pagination: Pagination | undefined;
  usersParams: UsersParams | undefined;
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}]

  constructor(private memberService: MembersService){
    this.usersParams = this.memberService.getUserParams();
  }

  ngOnInit(): void {
    this.loadMembers();
  } 

  loadMembers(){
    if(this.usersParams){
      this.memberService.setUserParams(this.usersParams);
      this.memberService.getMembers(this.usersParams).subscribe({
        next: response => {
          if (response.result && response.pagination){
            this.members = response.result;
            this.pagination = response.pagination;
          }
        }
      })
    };    
  }

  resetFilters() {
    this.usersParams = this.memberService.resetUserParams();
    this.loadMembers();
  }

  pagedChange(event: any){
    if(this.usersParams && this.usersParams?.pageNumber !== event.page)
    this.usersParams.pageNumber = event.page;
    if(this.usersParams)
    this.memberService.setUserParams(this.usersParams);
    this.loadMembers();
  }
} 

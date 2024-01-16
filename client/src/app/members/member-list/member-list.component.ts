import { Component, OnInit } from '@angular/core';
import { Observable, take } from 'rxjs';
import { Member } from 'src/app/_models/member';
import { Pagination } from 'src/app/_models/pagination';
import { User } from 'src/app/_models/user';
import { UsersParams } from 'src/app/_models/usersParams';
import { AccountService } from 'src/app/_services/account.service';
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
  user: User | undefined;
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}]

  constructor(private memberService: MembersService, private accountService: AccountService){
                this.accountService.currentUser$.pipe(take(1)).subscribe({
                  next: user => {
                    if (user) {
                      this.usersParams = new UsersParams(user);
                      this.user = user;
                    }
                  }
                })
              }

  ngOnInit(): void {
    this.loadMembers();
  } 

  loadMembers(){
    if(!this.usersParams) return;
    this.memberService.getMembers(this.usersParams).subscribe({
      next: response => {
        if (response.result && response.pagination){
          this.members = response.result;
          this.pagination = response.pagination;
        }
      }
    })
  }

  resetFilters() {
    if (this.user){
      this.usersParams = new UsersParams(this.user);
      this.loadMembers();
    }
  }

  pagedChange(event: any){
    if(this.usersParams && this.usersParams?.pageNumber !== event.page)
    this.usersParams.pageNumber = event.page;
    this.loadMembers();
  }
} 

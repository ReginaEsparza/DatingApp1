import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Member } from '../_models/member';
import { map, of, take } from 'rxjs';
import { UsersParams } from '../_models/usersParams';
import { AccountService } from './account.service';
import { User } from '../_models/user';
import { getPaginatedResult, getPaginationHeaders } from './paginationhelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiURL;
  members: Member[] = [];
  membercache = new Map();
  user: User | undefined;
  usersParams: UsersParams | undefined;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if (user) {
          this.usersParams = new UsersParams(user);
          this.user = user;
        }
      }
    })
  }

  getUserParams(){
    return this.usersParams;
  }

  setUserParams(params: UsersParams){
    this.usersParams = params;
  }

  resetUserParams() {
    if (this.user){
      this.usersParams = new UsersParams(this.user);
      return this.usersParams;
    }
    return;
  }

  getMembers(userParams: UsersParams){
    const response = this.membercache.get(Object.values(userParams).join('-'));

    if (response) return of(response);
    
    let params = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);

    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return getPaginatedResult<Member[]>(this.baseUrl + 'users', params, this.http).pipe(
      map(response => {
        this.membercache.set(Object.values(userParams).join('-'),response);
        return response;
      })
    )
  }

  
  getMember(username: string){
    const member = [...this.membercache.values()]
    .reduce((arr, elem) => arr.concat(elem.result), [])
    .find((member:Member) => member.userName === username);
    if(member) return of (member);
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member){
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(()=>{
        const index = this.members.indexOf(member);
        this.members[index] = {...this.members[index], ...member}
      })
    );
  }
 
  setMainPhoto(photoId: number){
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number){
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  addLike(userName: string){
    return this.http.post(this.baseUrl + 'likes/' + userName, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number)
  {
    let params = getPaginationHeaders(pageNumber, pageSize);

    params = params.append('predicate', predicate);
    return getPaginatedResult<Member[]>(this.baseUrl + 'likes', params, this.http);
  }
 
}

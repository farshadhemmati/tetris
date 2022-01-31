import { Injectable } from '@angular/core';
import { JsonServiceClient, GetNavItemsResponse, UserAttributes, IAuthSession } from '@servicestack/client';
import { BehaviorSubject, of } from 'rxjs';

var global: any = window;

@Injectable({
    providedIn: 'root',
})
export class StoreService
{
    nav: BehaviorSubject<GetNavItemsResponse> = null;
    userSession: BehaviorSubject<IAuthSession> = null;
    userAttributes: BehaviorSubject<string[]> = null;

    constructor(private client: JsonServiceClient) { 
        this.nav = new BehaviorSubject(global.NAV_ITEMS as GetNavItemsResponse);
        this.userSession = new BehaviorSubject(global.AUTH as IAuthSession);
        this.userAttributes = new BehaviorSubject(global.AUTH != null ? UserAttributes.fromSession(global.AUTH) : []);
    }

    public signIn(userSession:IAuthSession) {
        this.userSession.next(userSession);
        this.userAttributes.next(UserAttributes.fromSession(userSession));
    }

}

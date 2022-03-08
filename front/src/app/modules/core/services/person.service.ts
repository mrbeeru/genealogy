import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class PersonApiService {
    constructor(
        private http: HttpClient,
    ) {

    }

    async getAllPersonsAsync() : Promise<PersonV2[]>
    {
        return await lastValueFrom(this.http.get<PersonV2[]>(`${environment.appUrl}/Persons`));
    }
}


export interface PersonV2 
{
    id: string,
    firstName: string,
    lastName: string,
    gender: string,
    birthDate: {
        year: number,
        month?: number,
        day?: number,
    },
    deathDate?: {
        year: number,
        month?: number,
        day?:number,
    }
    
    motherId?: string,
    fatherId?: string,
    spouseIds?: string[],
    childrenIds?: string[]
}
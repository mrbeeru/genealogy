import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { environment } from "../../../../environments/environment";
import { PersonV2 } from "../models/person.model";

@Injectable({ providedIn: 'root' })
export class PersonService {
    constructor(
        private http: HttpClient,
    ) {

    }

    async getAllPersonsAsync() : Promise<PersonV2[]>
    {
        return await lastValueFrom(this.http.get<PersonV2[]>(`${environment.appUrl}/Persons`));
    }
}



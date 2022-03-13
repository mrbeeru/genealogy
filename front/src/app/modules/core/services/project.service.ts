import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { environment } from "src/environments/environment";
import { PersonV2 } from "../models/person.model";
import { ProjectModel } from "../models/project.model";
import { PersonService } from "./person.service";

@Injectable({ providedIn: 'root' })
export class ProjectService{
    
    projects: ProjectModel[] = []
    members: PersonV2[] = []

    constructor(
        private readonly personService: PersonService,
        private readonly http: HttpClient,
    ){
        this.projects.push(
            {id: "jesus", name: "jesus christ", memberCount: 1, visibility: "shared"},
            {id: "eli", name: "queen eli", memberCount: 221, visibility: "shared"},
            {id: "bubbles", name: "bubbles", memberCount: 52, visibility:"private"},
        )

        this.members.push(
            {
                id: "r1",
                projectId: "eli",
                firstName: "Elizabeth Alexandra Mary",
                lastName: "Winsdor",
                gender: "f",
                birthDate:{
                    year: 1926,
                    month: 4,
                    day: 21,
                },
                spouseIds:["r2"]
            },            
            {
                id: "r2",
                projectId: "eli",
                firstName: "Philip",
                lastName: "Mountbatten",
                gender: "m",
                birthDate:{
                    year: 1921,
                    month: 6,
                    day: 10,
                },
                deathDate:{
                    year: 2021,
                    month: 4,
                    day: 9,
                },
                spouseIds:["r1"]
            }
        )

        //just some hardcoded shit
        this.personService.getAllPersonsAsync().then(x => {
            x.forEach(m => m.projectId = "bubbles")
            this.members = this.members.concat(x)
        });
    }

    public async getProjectByIdAsync(id: string) : Promise<ProjectModel | undefined> {
        return await lastValueFrom(this.http.get<ProjectModel>(`${environment.appUrl}/Projects/${id}`));
    }

    
    public async getProjectMembersAsync(id: string): Promise<PersonV2[]>{
        return await lastValueFrom(this.http.get<PersonV2[]>(`${environment.appUrl}/Persons?projectId=${id}`));
    }

    public async getProjectsAsync() : Promise<ProjectModel[]>{
        return await lastValueFrom(this.http.get<ProjectModel[]>(`${environment.appUrl}/Projects`));
    }
}
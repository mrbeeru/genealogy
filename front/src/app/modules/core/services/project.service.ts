import { Injectable } from "@angular/core";
import { PersonV2 } from "../models/person.model";
import { ProjectModel } from "../models/project.model";
import { PersonService } from "./person.service";

@Injectable({ providedIn: 'root' })
export class ProjectService{
    
    projects: ProjectModel[] = []
    members: PersonV2[] = []

    constructor(
        private personService: PersonService
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

    public getById(id: string) : ProjectModel | undefined {
        return this.projects.find(x => x.id == id);
    }

    public getMembers(projectId: string): PersonV2[] | undefined{
        return this.members.filter(x => x.projectId == projectId)
    }

    public getProjects() : ProjectModel[]{
        return this.projects;
    }
}
import { Injectable } from "@angular/core";
import { ProjectModel } from "../models/project.model";

@Injectable({ providedIn: 'root' })
export class ProjectService{
    
    projects: ProjectModel[] = []

    constructor(){
        this.projects.push(
            {name: "jesus christ", memberCount: 1, visibility: "shared"},
            {name: "queen eli", memberCount: 221, visibility: "shared"},
            {name: "bubbles", memberCount: 52, visibility:"private"},
          )
    }

    public getById(id: string) : ProjectModel | undefined 
    {
        return this.projects.find(x => x.name == id);
    }
}
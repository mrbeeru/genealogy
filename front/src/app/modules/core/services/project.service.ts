import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { environment } from "src/environments/environment";
import { PersonV2 } from "../models/person.model";
import { ProjectModel } from "../models/project.model";
import { PersonService } from "./person.service";

@Injectable({ providedIn: 'root' })
export class ProjectService{
    
    constructor(
        private readonly http: HttpClient,
    ){

    }

    public async getProjectByIdAsync(id: string) : Promise<ProjectModel | undefined> {
        return await lastValueFrom(this.http.get<ProjectModel>(`${environment.appUrl}/projects/${id}`));
    }

    
    public async getProjectMembersAsync(id: string): Promise<PersonV2[]>{
        return await lastValueFrom(this.http.get<PersonV2[]>(`${environment.appUrl}/persons?projectId=${id}`));
    }

    public async getProjectsAsync() : Promise<ProjectModel[]>{
        return await lastValueFrom(this.http.get<ProjectModel[]>(`${environment.appUrl}/projects`));
    }

    public async getFeaturedProjectsAsync() : Promise<ProjectModel[]> {
        return await lastValueFrom(this.http.get<ProjectModel[]>(`${environment.appUrl}/projects?isFeatured=true`))
    }
}
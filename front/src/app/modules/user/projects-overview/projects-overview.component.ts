import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProjectModel } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';
import { CreateProjectDialogComponent } from '../create-project-dialog/create-project-dialog.component';

@Component({
  selector: 'app-projects-overview',
  templateUrl: './projects-overview.component.html',
  styleUrls: ['./projects-overview.component.scss']
})
export class ProjectsOverviewComponent implements OnInit {

  projects!: ProjectModel[];

  constructor(
    private dialog: MatDialog,
    private projectService: ProjectService) 
  {
  }

  async ngOnInit(): Promise<void> 
  {
    this.projects = await this.projectService.getProjectsAsync();
    this.projects.forEach(x => x.createdAt = parseInt(x.id.substring(0,8), 16) * 1000)
    
  }

  createProject(){
    const dialogRef = this.dialog.open(CreateProjectDialogComponent);

    dialogRef.afterClosed().subscribe((newProject: ProjectModel) => {
      if (newProject != null)
        this.projects.push(newProject)
    });
  }

}

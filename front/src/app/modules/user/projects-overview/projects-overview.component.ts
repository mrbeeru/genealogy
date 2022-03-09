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

  projects: ProjectModel[];

  constructor(
    private dialog: MatDialog,
    private projectService: ProjectService) 
  {
    this.projects = this.projectService.getProjects();
  }

  ngOnInit(): void {
   
  }

  createProject(){
    const dialogRef = this.dialog.open(CreateProjectDialogComponent);

    dialogRef.afterClosed().subscribe((newProject: ProjectModel) => {
      if (newProject != null)
        this.projects.push(newProject)
    });
  }

}

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProjectModel } from '../../core/models/project.model';
import { CreateProjectDialogComponent } from '../create-project-dialog/create-project-dialog.component';

@Component({
  selector: 'app-projects-overview',
  templateUrl: './projects-overview.component.html',
  styleUrls: ['./projects-overview.component.scss']
})
export class ProjectsOverviewComponent implements OnInit {

  projects: ProjectModel[] = []

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.projects.push(
      {name: "jesus christ", memberCount: 1, visibility: "shared"},
      {name: "queen eli", memberCount: 221, visibility: "shared"},
      {name: "bubbles", memberCount: 52, visibility:"private"},
    )
  }

  createProject(){
    const dialogRef = this.dialog.open(CreateProjectDialogComponent);

    dialogRef.afterClosed().subscribe((newProject: ProjectModel) => {
      this.projects.push(newProject)
    });
  }

}

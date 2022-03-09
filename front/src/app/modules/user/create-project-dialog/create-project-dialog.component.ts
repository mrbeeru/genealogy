import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProjectModel } from '../../core/models/project.model';

@Component({
  selector: 'app-create-project-dialog',
  templateUrl: './create-project-dialog.component.html',
  styleUrls: ['./create-project-dialog.component.scss']
})
export class CreateProjectDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CreateProjectDialogComponent>) { }

  ngOnInit(): void {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onOkClick(projectName: string){
    let project: ProjectModel = {
      id: (Date.now().toString()),
      name: projectName,
      memberCount: 0,
      visibility: "private"
    }

    this.dialogRef.close(project)
  }
}

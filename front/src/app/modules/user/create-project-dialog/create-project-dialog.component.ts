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
    let date = Date.now();

    let project: ProjectModel = {
      id: (date.toString()),
      name: projectName,
      memberCount: 0,
      visibility: "private",
      createdAt: date
    }

    this.dialogRef.close(project)
  }
}

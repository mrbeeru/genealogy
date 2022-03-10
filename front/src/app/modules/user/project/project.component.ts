import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { PersonV2 } from '../../core/models/person.model';
import { ProjectModel } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';
import { CreateMemberDialogComponent } from '../create-member-dialog/create-member-dialog.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  @Output() memberAdded: EventEmitter<PersonV2> = new EventEmitter<PersonV2>();

  project: ProjectModel;
  members: PersonV2[];
  selectedMember!: PersonV2;

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { 
    let id = this.route.snapshot.paramMap.get('id')

    this.project = this.getProject(id);
    this.members = this.getMembers(this.project); 
  }

  ngOnInit(): void {
    this.memberAdded.emit(undefined);
  }

  getProject(id: string | null)
  {
    if (id == null)
      throw new Error("Null id")

    let proj = this.projectService.getById(id)
    if (proj == null)
      throw new Error(`Project with id '${id}' does not exist`)

    return proj;
  }

  getMembers(project: ProjectModel): PersonV2[]
  {
      return this.projectService.getMembers(project.id) ?? [];
  }

  selectedMemberChanged(member: PersonV2){
    this.selectedMember = member;
  }

  createMember()
  {
    const dialogRef = this.dialog.open(CreateMemberDialogComponent);

    dialogRef.afterClosed().subscribe((newMember: PersonV2) => {

      if (newMember != null){
        newMember.id = Date.now().toString();
        this.members.push(newMember);
        (this.members[0].childrenIds = this.members[0].childrenIds || []).push(newMember.id)

        console.log(this.members)
        this.memberAdded.emit(newMember);
      }
    });
  }
}

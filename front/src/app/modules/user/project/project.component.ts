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
  @Output() membersChanged: EventEmitter<PersonV2[]> = new EventEmitter<PersonV2[]>();

  project!: ProjectModel;
  members!: PersonV2[];
  selectedMember!: PersonV2;

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { 
  }

  async ngOnInit(): Promise<void> {
    let id = this.route.snapshot.paramMap.get('id')
    
    let proj = await this.getProjectAsync(id);
    let members = await this.getMembersAsync(proj);
    this.project = proj;
    this.members = members;
    this.membersChanged.emit(members);
  }

  async getProjectAsync(id: string | null)
  {
    if (id == null)
      throw new Error('No id url parameter')

    let proj = await this.projectService.getProjectByIdAsync(id)

    if (proj == null)
      throw new Error(`Could not find project with id '${id}'`)

    return proj;
  }

  async getMembersAsync(project: ProjectModel): Promise<PersonV2[]>
  {
      return await this.projectService.getProjectMembersAsync(project.id) ?? [];
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

  addChild(parent: PersonV2)
  {
    const dialogRef = this.dialog.open(CreateMemberDialogComponent, {data: {parent: parent}});

    dialogRef.afterClosed().subscribe((child: PersonV2) => {

      if (child != null){
        child.id = Date.now().toString();
      
        this.members.push(child);

        //aldo add to spouse children ids?
        (parent.childrenIds = parent.childrenIds || []).push(child.id)
        console.log(this.members)
        this.memberAdded.emit(child);
      }
    });
  }

}

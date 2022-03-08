import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    let id = this.route.snapshot.paramMap.get('id')
    if (id == null)
      throw new Error("Null id")

    let proj = this.projectService.getById(id)
    if (proj == null)
      throw new Error(`Project with id '${id}' does not exist`)

    console.log(proj)
  }

}

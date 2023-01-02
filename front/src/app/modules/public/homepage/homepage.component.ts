import { Component, OnInit } from '@angular/core';
import { ProjectModel } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  public projects : ProjectModel[] = [];

  constructor(
    private projectService: ProjectService
  ) { }

  async ngOnInit(): Promise<void> {
    this.projects = await this.projectService.getFeaturedProjectsAsync();
  }

}

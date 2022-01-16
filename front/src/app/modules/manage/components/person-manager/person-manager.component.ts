import { Component, OnInit } from '@angular/core';
import { PersonApiService, PersonV2 } from 'src/app/services/api/person.service';

@Component({
  selector: 'app-person-manager',
  templateUrl: './person-manager.component.html',
  styleUrls: ['./person-manager.component.scss']
})
export class PersonManagerComponent implements OnInit {

  persons : PersonV2[] = [];


  constructor(private personService: PersonApiService) 
  {

  }

  async ngOnInit(): Promise<void> {
    this.persons = await this.personService.getAllPersonsAsync();
  }

}

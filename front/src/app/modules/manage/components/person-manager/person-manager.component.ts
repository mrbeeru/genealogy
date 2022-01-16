import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PersonApiService, PersonV2 } from 'src/app/services/api/person.service';

@Component({
  selector: 'app-person-manager',
  templateUrl: './person-manager.component.html',
  styleUrls: ['./person-manager.component.scss']
})
export class PersonManagerComponent implements OnInit {

  persons : PersonV2[] = [];
  filteredPersons: Observable<PersonV2[]>;

  constructor(private personService: PersonApiService) 
  {
    this.filteredPersons = new Observable();
  }

  async ngOnInit(): Promise<void> {
    let persons = await this.personService.getAllPersonsAsync();
    persons.sort((a,b) => a.lastName < b.lastName ? -1 : 1)

    this.persons = persons;
  }

}

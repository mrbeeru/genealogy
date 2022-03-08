import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PersonApiService, PersonV2 } from 'src/app/modules/core/services/person.service';

@Component({
  selector: 'app-person-manager',
  templateUrl: './person-manager.component.html',
  styleUrls: ['./person-manager.component.scss']
})
export class PersonManagerComponent implements OnInit {

  persons : PersonV2[] = [];
  filteredPersons: PersonV2[] = [];

  constructor(private personService: PersonApiService) 
  {
  }

  async ngOnInit(): Promise<void> {
    let persons = await this.personService.getAllPersonsAsync();
    persons.sort((a,b) => a.lastName < b.lastName ? -1 : 1)

    this.persons = persons;
    this.filteredPersons = persons;
  }


  search($event : any)
  {
    let searchValue : string = $event.target.value;

    if (searchValue === '')
    {
      this.filteredPersons = this.persons;
      return;
    }

    searchValue = searchValue.replace(" ", "");

    this.filteredPersons = this.persons.filter(x => 
      (x.lastName.toLowerCase() + x.firstName.toLowerCase()).includes(searchValue) ||
      (x.firstName.toLowerCase() + x.lastName.toLowerCase()).includes(searchValue))
  }
}

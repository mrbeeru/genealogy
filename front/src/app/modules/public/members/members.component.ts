import { Component, OnInit } from '@angular/core';
import { PersonApiService, PersonV2 } from 'src/app/services/api/person.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {

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

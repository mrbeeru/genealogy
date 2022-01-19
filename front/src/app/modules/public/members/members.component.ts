import { Component, OnInit } from '@angular/core';
import { PersonApiService, PersonV2 } from 'src/app/services/api/person.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {

  sortOptions = ["Name (Up)", "Name (Down)", "Birth Date (Up)", "Birth Date (Down)"]
  selectedSortOption: string;

  persons: PersonV2[] = [];
  filteredPersons: PersonV2[] = [];

  constructor(private personService: PersonApiService) {
    this.selectedSortOption = this.sortOptions[0];
  }

  async ngOnInit(): Promise<void> {
    let persons = await this.personService.getAllPersonsAsync();
    this.sortPersons(persons, this.selectedSortOption);

    this.persons = persons;
    this.filteredPersons = persons;
  }


  search($event: any) {
    let searchValue: string = $event.target.value;

    if (searchValue === '') {
      this.filteredPersons = this.persons;
      return;
    }

    searchValue = searchValue.replace(" ", "");

    this.filteredPersons = this.persons.filter(x =>
      (x.lastName.toLowerCase() + x.firstName.toLowerCase()).includes(searchValue) ||
      (x.firstName.toLowerCase() + x.lastName.toLowerCase()).includes(searchValue))
  }

  sortChanged(sortOption: any) {
    this.sortPersons(this.filteredPersons, sortOption)
  }

  sortPersons(persons: PersonV2[], sortOption: string) {
    switch (sortOption) {
      case "Name (Up)":
        persons.sort((a, b) => a.lastName + a.firstName < b.lastName + b.firstName ? -1 : 1)
        break;

      case "Name (Down)":
        persons.sort((a, b) => a.lastName + a.firstName < b.lastName + b.firstName ? 1 : -1)
        break;

      case "Birth Date (Up)":
        persons.sort((a, b) => a.birthDate.year < b.birthDate.year ? -1 : 1)
        break;

      case "Birth Date (Down)":
        persons.sort((a, b) => a.birthDate.year < b.birthDate.year ? 1 : -1)
        break;
    }
  }
}

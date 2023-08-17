import axios from 'axios';
import { PersonDTO } from '../dto/PersonDTO';

export class PersonApi {
    //apiUrl = 'https://mrbeeru.vps.webdock.cloud:10010/api/v1/persons';
    apiUrl = 'http://localhost:10010/api/v1/persons';

    async getPersons(projectId: string) {
        return (await axios.get<PersonDTO[]>(`${this.apiUrl}`, { params: { projectId } })).data;
    }
}

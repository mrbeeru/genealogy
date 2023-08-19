import axios from 'axios';
import { PersonDTO } from '../dto/PersonDTO';
import { sampleFamily } from '../mock-data';

export interface IPersonApi {
    getPersons(projectId: string): Promise<PersonDTO[]>;
}

export class PersonApi implements IPersonApi {
    //apiUrl = 'https://mrbeeru.vps.webdock.cloud:10010/api/v1/persons';
    apiUrl = 'http://localhost:10010/api/v1/persons';

    async getPersons(projectId: string): Promise<PersonDTO[]> {
        return (await axios.get<PersonDTO[]>(`${this.apiUrl}`, { params: { projectId } })).data;
    }
}

export class PersonApiMock implements IPersonApi {
    async getPersons(projectId: string): Promise<PersonDTO[]> {
        return sampleFamily as PersonDTO[];
    }
}

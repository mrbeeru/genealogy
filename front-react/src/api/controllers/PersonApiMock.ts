import { PersonDTO } from '../dto/PersonDTO.ts';
import royalFamily from '../mock-data.ts';
import { IPersonApi } from './PersonApi.ts';

export default class PersonApiMock implements IPersonApi {
    async getPersons(projectId: string): Promise<PersonDTO[]> {
        return royalFamily as PersonDTO[];
    }
}

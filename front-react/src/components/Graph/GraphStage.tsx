import { useEffect, useState } from 'react';
import PersonApiMock from '../../api/controllers/PersonApiMock';
import { PersonDTO } from '../../api/dto/PersonDTO';
import TimelineGraph from './TimelineGraph/TimelineGraph.component';

export default function GraphStage() {
    const [persons, setPersons] = useState<PersonDTO[]>([]);

    useEffect(() => {
        const personApi = new PersonApiMock();
        const fn = async () => {
            const p = await personApi.getPersons('6345c0b151be4f7071618c88');
            // const persons = await personApi.getPersons('6320bdfc86d047176e1da056');
            setPersons(p);
        };

        fn();
    }, []);

    return <> {persons.length && <TimelineGraph persons={persons} />} </>;
}

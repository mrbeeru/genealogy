import { useQuery } from 'react-query';
import PersonApiMock from '../../api/controllers/PersonApiMock';
import { usePersons, usefamilyStoreActions } from '../../store/FamilyStore';
import TimelineGraph from './TimelineGraph/TimelineGraph.component';

export default function GraphStage() {
    const persons = usePersons();
    const familyStoreActions = usefamilyStoreActions();

    const { isLoading, error } = useQuery('personData', async () => {
        const data = await new PersonApiMock().getPersons('6345c0b151be4f7071618c88');
        familyStoreActions.setPersons(data);
        return data;
    });

    if (isLoading) return 'Loading...';
    if (error) return 'Error occured while fetching data.';

    return <TimelineGraph persons={persons} />;
}

import { useQuery } from 'react-query';
import PersonApiMock from '../../api/controllers/PersonApiMock';
import TimelineGraph from './TimelineGraph/TimelineGraph.component';

export default function GraphStage() {
    const { isLoading, error, data } = useQuery('personData', async () => {
        const response = await new PersonApiMock().getPersons('6345c0b151be4f7071618c88');
        return response;
    });

    if (isLoading) return 'Loading...';
    if (error) return 'Error occured while fetching data.';

    return <TimelineGraph persons={data || []} />;
}

import { QueryClient, QueryClientProvider } from 'react-query';
import './App.css';
import GraphStage from './components/Graph/GraphStage';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <GraphStage />
        </QueryClientProvider>
    );
}

export default App;

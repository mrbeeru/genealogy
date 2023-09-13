import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import './App.css';
import GraphStage from './components/Graph/GraphStage';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Suspense fallback={<div>loading...</div>}>
                <GraphStage />
            </Suspense>
        </QueryClientProvider>
    );
}

export default App;

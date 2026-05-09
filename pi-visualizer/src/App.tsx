import { useState } from 'react';
import { Layout } from './components/Layout';
import { FunWithPi } from './components/FunWithPi';
import { MonteCarloCategory } from './components/categories/MonteCarloCategory';
import { InfiniteSeriesCategory } from './components/categories/InfiniteSeriesCategory';
import { GeometricCategory } from './components/categories/GeometricCategory';

function App() {
  const [activeTab, setActiveTab] = useState('monte-carlo');

  const renderContent = () => {
    switch (activeTab) {
      case 'monte-carlo':
        return <MonteCarloCategory />;
      case 'infinite-series':
        return <InfiniteSeriesCategory />;
      case 'geometric':
        return <GeometricCategory />;
      case 'fun-with-pi':
        return <FunWithPi />;
      default:
        return <MonteCarloCategory />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;

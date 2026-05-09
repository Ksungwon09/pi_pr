import { useState } from 'react';
import { Layout } from './components/Layout';
import { MonteCarlo } from './components/MonteCarlo';
import { GregoryLeibniz } from './components/GregoryLeibniz';
import { Archimedes } from './components/Archimedes';
import { FunWithPi } from './components/FunWithPi';

function App() {
  const [activeTab, setActiveTab] = useState('monte-carlo');

  const renderContent = () => {
    switch (activeTab) {
      case 'monte-carlo':
        return <MonteCarlo />;
      case 'gregory-leibniz':
        return <GregoryLeibniz />;
      case 'archimedes':
        return <Archimedes />;
      case 'fun-with-pi':
        return <FunWithPi />;
      default:
        return <MonteCarlo />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;

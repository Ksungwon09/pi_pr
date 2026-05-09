import React, { useState } from 'react';
import { SubTabs } from '../SubTabs';
import { GregoryLeibniz } from '../GregoryLeibniz';
import { BaselProblem } from '../BaselProblem';

export const InfiniteSeriesCategory: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('gregory-leibniz');

  const tabs = [
    { id: 'gregory-leibniz', label: 'Gregory-Leibniz Series' },
    { id: 'basel', label: 'Basel Problem' },
  ];

  return (
    <div className="flex flex-col h-full">
      <SubTabs tabs={tabs} activeTab={activeSubTab} setActiveTab={setActiveSubTab} />
      <div className="flex-1 overflow-auto">
        {activeSubTab === 'gregory-leibniz' && <GregoryLeibniz />}
        {activeSubTab === 'basel' && <BaselProblem />}
      </div>
    </div>
  );
};
